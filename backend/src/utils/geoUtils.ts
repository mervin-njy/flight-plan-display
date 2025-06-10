import { Coord } from "../models/Airway";

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
  reference: Coord
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
