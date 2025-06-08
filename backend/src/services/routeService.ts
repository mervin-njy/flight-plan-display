import axios from "axios";
import { fetchFlights } from "./flightManager";
import { Flight } from "../models/Flight";
import { Waypoint } from "../models/Airway";

const api = axios.create({
  baseURL: process.env.API_URI,
  headers: { apikey: process.env.API_KEY },
});

async function resolveCoordinates(
  code: string,
  type: "fixes" | "navaids"
): Promise<string[]> {
  try {
    const existsRes = await api.get<boolean>(
      `/geopoints/exist/${type}/${code}`
    );
    if (!existsRes.data) {
      return [];
    }
  } catch (err) {
    console.warn(
      `Error checking existence for ${code} in ${type}:`,
      (err as any).message
    );
    return [];
  }

  try {
    const searchRes = await api.get<string[]>(
      `/geopoints/search/${type}/${code}`
    );
    return searchRes.data;
  } catch (err) {
    // If 404 or other error, return empty and log
    console.warn(`Search for ${code} in ${type} failed:`, (err as any).message);
    return [];
  }
}

export async function getRouteElementsByCallsign(
  callsign: string
): Promise<Waypoint[]> {
  // Find the flight with matching callsign (case-insensitive)
  const flights: Flight[] = await fetchFlights();
  const flight = flights.find(
    (f) => f.aircraftIdentification.toUpperCase() === callsign.toUpperCase()
  );
  if (!flight) {
    throw new Error(`Flight with callsign ${callsign} not found`);
  }

  const elements = flight.filedRoute?.routeElement;
  if (!elements || elements.length === 0) {
    console.warn(`No route elements found for flight ${callsign}`);
    return [];
  }
  const waypoints: Waypoint[] = [];

  for (const elem of elements) {
    const code = elem.position?.designatedPoint;
    if (!code) {
      console.warn(
        `Skipping route element with missing designatedPoint: ${JSON.stringify(
          elem
        )}`
      );
      continue;
    }

    const type = code.length < 4 ? "navaids" : "fixes";
    const rawList = await resolveCoordinates(code, type);

    const match = rawList.find((entry) => entry.startsWith(`${code} `));
    if (!match) {
      console.warn(`No coordinates found for ${code}`);
      continue;
    }

    const coordsMatch = match.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
    if (!coordsMatch) {
      console.warn(`Unable to parse coordinates for ${code}: ${match}`);
      continue;
    }
    const lat = parseFloat(coordsMatch[1]);
    const lon = parseFloat(coordsMatch[2]);

    waypoints.push({
      designatedPoint: code,
      type: type,
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
