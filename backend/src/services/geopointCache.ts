// geopointCache.ts
import axios from "axios";
import { Waypoint } from "../models/Airway"; // adjust path if needed

const api = axios.create({
  baseURL: process.env.API_URI,
  headers: { apikey: process.env.API_KEY },
});

// Main in-memory caches
export const fixesLookup: Record<string, Waypoint> = {};
export const navaidsLookup: Record<string, Waypoint> = {};
export const airportsLookup: Record<string, Waypoint> = {};

// Init function to populate lookups
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

// Helper: fetch raw list from API
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

// Helper: fill cache dict from raw strings
function populateLookup(
  cache: Record<string, Waypoint>,
  data: string[],
  type: "fixes" | "navaids" | "airports"
): void {
  for (const entry of data) {
    const match = entry.match(/^(\S+)\s+\(([-\d.]+),\s*([-\d.]+)\)$/);
    if (!match) continue;
    const [_, code, lat, lon] = match;

    cache[code] = {
      designatedPoint: code,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      type,
    };
  }
}

// Lookup method used in route resolution
export function getCachedGeopoint(
  code: string,
  type: "fixes" | "navaids"
): Waypoint | null {
  return type === "fixes"
    ? fixesLookup[code] || null
    : navaidsLookup[code] || null;
}

// Lookup for airport
export function getCachedAirport(code: string): Waypoint | null {
  return airportsLookup[code] || null;
}
