import axios from "axios";
import {
  getResolvedGeopointCandidate,
  getCachedAirportCandidates,
} from "./geopointCache";
import { fetchFlights } from "./flightManager";
import { Flight, RouteElement } from "../models/Flight";
import { Waypoint } from "../models/Airway";

const api = axios.create({
  baseURL: process.env.API_URI,
  headers: { apikey: process.env.API_KEY },
});

export async function getRouteElementsById(id: string): Promise<Waypoint[]> {
  const flights: Flight[] = await fetchFlights();
  const flight = flights.find((f) => f._id === id);
  if (!flight) throw new Error(`Flight id not found`);

  const elements: RouteElement[] = flight.filedRoute?.routeElement || [];
  const waypoints: Waypoint[] = [];

  if (elements.length === 0) {
    console.warn(
      `No route elements found for flight ${flight.aircraftIdentification}`
    );
    return [];
  }

  const dep = flight.departure?.departureAerodrome;
  const arr = flight.arrival?.destinationAerodrome;
  const depCoord =
    dep && getCachedAirportCandidates(dep)[0]?.lat
      ? {
          lat: getCachedAirportCandidates(dep)[0]!.lat,
          lon: getCachedAirportCandidates(dep)[0]!.lon,
        }
      : null;
  const arrCoord =
    arr && getCachedAirportCandidates(arr)[0]?.lat
      ? {
          lat: getCachedAirportCandidates(arr)[0]!.lat,
          lon: getCachedAirportCandidates(arr)[0]!.lon,
        }
      : null;

  for (let i = 0; i < elements.length; i++) {
    const elem = elements[i];
    const code = elem.position?.designatedPoint;
    const type = code?.length < 4 ? "navaids" : "fixes";

    let lat: number | null = null;
    let lon: number | null = null;

    if (code) {
      const reference = waypoints[i - 1]?.lat
        ? { lat: waypoints[i - 1].lat!, lon: waypoints[i - 1].lon! }
        : depCoord || arrCoord || null;

      const resolved = getResolvedGeopointCandidate(code, type, reference);
      if (resolved) {
        lat = resolved.lat;
        lon = resolved.lon;
      }
    }

    waypoints.push({
      designatedPoint: code || "",
      type: type || "unknown",
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
