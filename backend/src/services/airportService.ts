import { getResolvedAirportCandidate } from "./geopointCache";
import axios from "axios";
import { fetchFlights } from "./flightManager";
import { Flight } from "../models/Flight";
import { Waypoint, TransitCoords } from "../models/Airway";

const api = axios.create({
  baseURL: process.env.API_URI,
  headers: { apikey: process.env.API_KEY },
});

const airportCache: Record<string, Waypoint | null> = {};

export async function resolveAirportCoordinates(
  code: string
): Promise<Waypoint | null> {
  if (!code) return null;

  const cached = getResolvedAirportCandidate(code, null);
  if (cached) return cached;

  if (code in airportCache) return airportCache[code];

  try {
    const result = await api.get<string[]>(
      `/geopoints/search/airports/${code}`
    );
    const match = result.data.find((entry) => entry.startsWith(`${code} `));
    if (match) {
      const coordsMatch = match.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
      if (coordsMatch) {
        const waypoint: Waypoint = {
          designatedPoint: code,
          type: "airport",
          seqNum: 0,
          lat: parseFloat(coordsMatch[1]),
          lon: parseFloat(coordsMatch[2]),
        };

        // Store as an array in cache (if not already populated via init)
        airportCache[code] = waypoint;
        return waypoint;
      }
    }
  } catch (err) {
    console.warn(`Error fetching airport ${code}:`, (err as any).message);
  }

  airportCache[code] = null;
  return null;
}

export async function getDepartureArrivalCoordsById(
  flightId: string
): Promise<TransitCoords | null> {
  const flights: Flight[] = await fetchFlights();
  const flight = flights.find((f) => f._id === flightId);
  if (!flight)
    throw new Error(`Flight ID not found. Unable to resolve coordinates.`);

  const depCode = flight.departure?.departureAerodrome;
  const arrCode = flight.arrival?.destinationAerodrome;

  const [departure, arrival] = await Promise.all([
    resolveAirportCoordinates(depCode || ""),
    resolveAirportCoordinates(arrCode || ""),
  ]);

  return { departure, arrival };
}
