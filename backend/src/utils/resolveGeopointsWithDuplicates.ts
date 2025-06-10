import { resolveDuplicateByProximity } from "./geoUtils";
import { Coord, Waypoint } from "../models/Airway";
import { Console } from "console";

function parseGeopointCandidates(code: string, rawList: string[]): Coord[] {
  return rawList
    .filter((entry) => entry.startsWith(`${code} `))
    .map((entry) => {
      const match = entry.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
      if (!match) return null;
      return {
        lat: parseFloat(match[1]) || null,
        lon: parseFloat(match[2]) || null,
      };
    })
    .filter((c): c is Coord => c !== null);
}

/**
 * Resolve the best-matching geopoint from duplicates using proximity to previous/next/dep/arr.
 */
export function resolveGeopointWithDuplicates(
  rawList: string[],
  code: string,
  type: "fixes" | "navaids",
  currentIndex: number,
  routeSoFar: Waypoint[],
  depCoord: Coord | null,
  arrCoord: Coord | null
): Waypoint | null {
  console.log(
    `Resolving geopoint ${code} of type ${type} with ${rawList.length} candidates (duplicates)`
  );

  if (rawList.length <= 1) return null;
  const candidates = parseGeopointCandidates(code, rawList);
  if (candidates.length === 0) return null;

  const prev = routeSoFar[currentIndex - 1];
  const next = routeSoFar[currentIndex + 1];

  const prevCoord: Coord | null =
    prev?.lat && prev?.lon ? { lat: prev.lat, lon: prev.lon } : null;
  const nextCoord: Coord | null =
    next?.lat && next?.lon ? { lat: next.lat, lon: next.lon } : null;

  const reference = prevCoord || nextCoord || depCoord || arrCoord || null;

  const chosen = reference
    ? resolveDuplicateByProximity(candidates, reference)
    : candidates[0];

  if (!chosen) return null;

  return {
    designatedPoint: code,
    lat: chosen.lat,
    lon: chosen.lon,
    type: type === "fixes" ? "fix" : "navaid",
  };
}
