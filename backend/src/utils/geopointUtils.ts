import { RouteElement } from "../models/Flight";
import { Coord, Waypoint } from "../models/Airway";
import { getCachedGeopointCandidates } from "../services/geopointCache";

/**
 * Calculate the great-circle (haversine) distance between two geographic coordinates.
 * @param a First coordinate
 * @param b Second coordinate
 * @returns Distance in nautical miles (NM)
 */
export function haversineDistance(a: Coord, b: Coord): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const R = 3440.1; // Earth radius in nautical miles
  const dLat = toRad(b.lat! - a.lat!);
  const dLon = toRad(b.lon! - a.lon!);

  const lat1 = toRad(a.lat!);
  const lat2 = toRad(b.lat!);

  // Haversine formula
  // a = sin²(dLat/2) + cos(lat1) * cos(lat2) * sin²(dLon/2)
  const aCalc =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  // c = 2 * atan2(√a, √(1−a))
  const c = 2 * Math.atan2(Math.sqrt(aCalc), Math.sqrt(1 - aCalc));

  return R * c; // Distance in NM
}

/**
 * Resolve the closest coordinate from a list of candidates based on haversine distance.
 * @param candidates List of possible coordinates (from duplicate fix/navaid names)
 * @param reference A known valid coordinate (e.g., previous or next waypoint)
 * @returns Closest coordinate, or null if none valid
 */
export function resolveDuplicateByProximity(
  candidates: Coord[],
  reference: Coord | null
): Coord | null {
  if (!reference || candidates.length <= 1) return null;

  let minDist = Infinity;
  let closest: Coord | null = null;

  for (const c of candidates) {
    if (c.lat == null || c.lon == null) continue;

    const dist = haversineDistance(reference, c);
    if (dist < minDist) {
      minDist = dist;
      closest = c;
    }
  }

  return closest;
}

/**
 * Resolve a waypoint by its code, using previous resolved waypoints and departure coordinates as references.
 * This is useful for cases where the waypoint might have multiple candidates (e.g., duplicate fix/navaid names).
 * @param code The waypoint code (e.g., fix or navaid identifier)
 * @param type The type of waypoint ("fixes" or "navaids")
 * @param previousResolved Previously resolved waypoints to use as reference
 * @param depCoord Departure coordinates to use if no previous reference is found
 * @returns The best matching waypoint, or null if no candidates are found
 */
export function resolveGeopointByPreviousRef(
  code: string,
  type: "fixes" | "navaids",
  previousResolved: Waypoint[],
  depCoord: Coord | null
): Waypoint | null {
  const candidates = getCachedGeopointCandidates(code, type);
  if (!candidates || candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];

  // Try to get most recent resolved geopoint with valid coords
  let prevRef: Coord | null = null;

  for (let i = previousResolved.length - 1; i >= 0; i--) {
    const wp = previousResolved[i];
    if (wp.lat != null && wp.lon != null) {
      prevRef = { lat: wp.lat, lon: wp.lon };
      break;
    }
  }

  const reference = prevRef || depCoord;
  if (!reference) return candidates[0];

  // Compute closest match
  let bestCandidate: Waypoint | null = null;
  let minDist = Infinity;

  for (const cand of candidates) {
    if (cand.lat == null || cand.lon == null) continue;
    const dist = haversineDistance(reference, {
      lat: cand.lat,
      lon: cand.lon,
    });

    if (dist < minDist) {
      minDist = dist;
      bestCandidate = cand;
    }
  }

  return bestCandidate || candidates[0];
}
