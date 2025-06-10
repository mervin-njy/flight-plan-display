import axios from "axios";
import { fixesLookup, navaidsLookup, getCachedGeopoint } from "./geopointCache";
import { fetchFlights } from "./flightManager";
import { Flight, RouteElement } from "../models/Flight";
import { Waypoint } from "../models/Airway";

const api = axios.create({
  baseURL: process.env.API_URI,
  headers: { apikey: process.env.API_KEY },
});

const coordinateCache: Record<string, string[]> = {};

async function resolveCoordinates(
  code: string,
  type: "fixes" | "navaids"
): Promise<string[]> {
  const key = `${type}:${code}`;
  if (coordinateCache[key]) return coordinateCache[key]; // in-memory deduplication

  try {
    const res = await api.get<string[]>(`/geopoints/search/${type}/${code}`);
    coordinateCache[key] = res.data;

    // Parse and add to structured lookup cache
    const match = res.data.find((entry) => entry.startsWith(`${code} `));
    if (match) {
      const coordsMatch = match.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
      if (coordsMatch) {
        const lat = parseFloat(coordsMatch[1]);
        const lon = parseFloat(coordsMatch[2]);

        const wp: Waypoint = {
          designatedPoint: code,
          lat,
          lon,
          type,
          seqNum: 0,
        };

        if (type === "fixes") fixesLookup[code] = wp;
        else navaidsLookup[code] = wp;
      }
    }

    return res.data;
  } catch (err) {
    console.warn(`Error resolving ${type} ${code}:`, (err as any).message);
    coordinateCache[key] = []; // avoid retry flood
    return [];
  }
}

export async function getRouteElementsById(id: string): Promise<Waypoint[]> {
  const flights: Flight[] = await fetchFlights();
  const flight = flights.find((f) => f._id === id);
  if (!flight) {
    throw new Error(`Flight id not found`);
  }

  const elements: RouteElement[] = flight.filedRoute?.routeElement;
  if (!elements || elements.length === 0) {
    console.warn(
      `No route elements found for flight ${flight.aircraftIdentification}`
    );
    return [];
  }

  const waypoints: Waypoint[] = [];

  for (const elem of elements) {
    const code: string = elem.position?.designatedPoint;
    let lat: number | null = null;
    let lon: number | null = null;

    // !code may refer to SID & STAR procedures, which we will still include in the returned waypoints
    if (code) {
      const type = code.length < 4 ? "navaids" : "fixes";
      const cached = getCachedGeopoint(code, type);
      // Check if coordinates are cached
      if (cached) {
        lat = cached.lat;
        lon = cached.lon;
      } else {
        // If not found in cache, resolve coordinates from API
        const rawList = await resolveCoordinates(code, type);
        const match = rawList.find((entry) => entry.startsWith(`${code} `));
        if (match) {
          const coordsMatch = match.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
          if (coordsMatch) {
            lat = parseFloat(coordsMatch[1]);
            lon = parseFloat(coordsMatch[2]);
          }
        }
      }
    }

    waypoints.push({
      designatedPoint: code,
      type: code ? (code.length < 4 ? "navaids" : "fixes") : elem.airwayType,
      seqNum: elem.seqNum,
      lat,
      lon,
      airway: elem.airway,
      airwayType: elem.airwayType,
      changeLevel: elem.changeLevel,
      changeSpeed: elem.changeSpeed,
    });
  }
  return waypoints;
}
