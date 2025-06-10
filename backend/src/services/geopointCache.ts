import axios from "axios";
import { Coord, Waypoint } from "../models/Airway";
import { resolveDuplicateByProximity } from "../utils/geoUtils";

const api = axios.create({
  baseURL: process.env.API_URI,
  headers: { apikey: process.env.API_KEY },
});

export const fixesLookup: Record<string, Waypoint[]> = {};
export const navaidsLookup: Record<string, Waypoint[]> = {};
export const airportsLookup: Record<string, Waypoint[]> = {};

export async function initGeopointCaches(): Promise<void> {
  console.log("Initializing geopoint caches...");

  const [fixes, navaids, airports] = await Promise.all([
    loadList("fixes"),
    loadList("navaids"),
    loadList("airports"),
  ]);

  populateLookup(fixesLookup, fixes, "fixes");
  populateLookup(navaidsLookup, navaids, "navaids");
  populateLookup(airportsLookup, airports, "airports");

  console.log("Geopoint caches loaded.");
}

async function loadList(
  type: "fixes" | "navaids" | "airports"
): Promise<string[]> {
  try {
    const res = await api.get<string[]>(`/geopoints/list/${type}`);
    return res.data;
  } catch (err) {
    console.warn(`Failed to load list of ${type}:`, (err as any).message);
    return [];
  }
}

function populateLookup(
  cache: Record<string, Waypoint[]>,
  data: string[],
  type: "fixes" | "navaids" | "airports"
): void {
  const displayType =
    type === "airports" ? "airport" : type === "fixes" ? "fix" : "navaid";

  for (const entry of data) {
    const match = entry.match(/^(\S+)\s+\(([-\d.]+),\s*([-\d.]+)\)$/);
    if (!match) continue;

    const [_, code, lat, lon] = match;

    const waypoint: Waypoint = {
      designatedPoint: code,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      type: displayType,
    };

    if (!cache[code]) cache[code] = [];
    cache[code].push(waypoint);
  }
}

export function getCachedGeopointCandidates(
  code: string,
  type: "fixes" | "navaids"
): Waypoint[] {
  return type === "fixes" ? fixesLookup[code] || [] : navaidsLookup[code] || [];
}

export function getResolvedGeopointCandidate(
  code: string,
  type: "fixes" | "navaids",
  reference: Coord | null
): Waypoint | null {
  const candidates = getCachedGeopointCandidates(code, type);
  if (candidates.length === 0) return null;
  if (candidates.length === 1 || !reference) return candidates[0];

  const coords = candidates
    .filter((c) => c.lat != null && c.lon != null)
    .map((c) => ({ lat: c.lat!, lon: c.lon! }));

  const best = resolveDuplicateByProximity(coords, reference);
  if (!best) return candidates[0];

  return (
    candidates.find((c) => c.lat === best.lat && c.lon === best.lon) ||
    candidates[0]
  );
}

export function getCachedAirportCandidates(code: string): Waypoint[] {
  return airportsLookup[code] || [];
}

export function getResolvedAirportCandidate(
  code: string,
  reference: Coord | null
): Waypoint | null {
  const candidates = getCachedAirportCandidates(code);
  if (candidates.length === 0) return null;
  if (candidates.length === 1 || !reference) return candidates[0];

  const coords = candidates
    .filter((c) => c.lat != null && c.lon != null)
    .map((c) => ({ lat: c.lat!, lon: c.lon! }));

  const best = resolveDuplicateByProximity(coords, reference);
  if (!best) return candidates[0];

  return (
    candidates.find((c) => c.lat === best.lat && c.lon === best.lon) ||
    candidates[0]
  );
}
