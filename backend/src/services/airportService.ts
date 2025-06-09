import axios from "axios";
import { fetchFlights } from "./flightManager";
import { Flight } from "../models/Flight";
import { TransitCoords, Waypoint } from "../models/Airway";

const api = axios.create({
  baseURL: process.env.API_URI,
  headers: { apikey: process.env.API_KEY },
});

async function resolveAirportCoordinates(
  code: string
): Promise<{ lat: number | null; lon: number | null }> {
  if (!code) return { lat: null, lon: null };

  try {
    const existsRes = await api.get<boolean>(
      `/geopoints/exist/airports/${code}`
    );
    if (!existsRes.data) {
      console.warn(`Airport code ${code} not found`);
      return { lat: null, lon: null };
    }
  } catch (err) {
    console.warn(`Error checking airport ${code}:`, (err as any).message);
    return { lat: null, lon: null };
  }

  try {
    const result = await api.get<string[]>(
      `/geopoints/search/airports/${code}`
    );
    const match = result.data.find((entry) => entry.startsWith(`${code} `));
    if (match) {
      const coordsMatch = match.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
      if (coordsMatch) {
        return {
          lat: parseFloat(coordsMatch[1]),
          lon: parseFloat(coordsMatch[2]),
        };
      }
    }
  } catch (err) {
    console.warn(
      `Failed to fetch coordinates for airport ${code}:`,
      (err as any).message
    );
  }

  return { lat: null, lon: null };
}

export async function getDepartureArrivalCoordsById(
  flightId: string
): Promise<TransitCoords | null> {
  const flights: Flight[] = await fetchFlights();
  const flight = flights.find((f) => f._id === flightId);
  if (!flight) throw new Error(`Flight with ID ${flightId} not found`);

  const depCode = flight.departure?.departureAerodrome;
  const arrCode = flight.arrival?.destinationAerodrome;

  const [depCoords, arrCoords] = await Promise.all([
    resolveAirportCoordinates(depCode || ""),
    resolveAirportCoordinates(arrCode || ""),
  ]);

  const departure: Waypoint | null = depCode
    ? {
        designatedPoint: depCode,
        type: "airport",
        seqNum: -1, // Using -1 to indicate departure
        lat: depCoords.lat,
        lon: depCoords.lon,
        airwayType: "DEPARTURE",
      }
    : null;

  const arrival: Waypoint | null = arrCode
    ? {
        designatedPoint: arrCode,
        type: "airport",
        seqNum: -2, // Using -2 to indicate arrival
        lat: arrCoords.lat,
        lon: arrCoords.lon,
        airwayType: "ARRIVAL",
      }
    : null;

  return { departure, arrival };
}
