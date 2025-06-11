import axios from "axios";
import { getCachedAirportCandidates } from "./geopointCache";
import { fetchFlights } from "./flightManager";
import { Flight, RouteElement } from "../models/Flight";
import { Waypoint } from "../models/Airway";
import { resolveGeopointByPreviousRef } from "../utils/geopointUtils";

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
      const resolved = resolveGeopointByPreviousRef(
        code,
        type,
        waypoints, // only resolved ones so far
        depCoord
      );

      if (resolved) {
        lat = resolved.lat;
        lon = resolved.lon;
      }
    }

    const displayType = code
      ? type === "navaids"
        ? "navaid"
        : "fix"
      : elem.airwayType; // Use airwayType if no code (SID/STAR)

    waypoints.push({
      designatedPoint: code || "",
      type: displayType || "unknown",
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
