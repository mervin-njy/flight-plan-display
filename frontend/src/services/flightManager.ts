import axios from "axios";
import type { Flight } from "../types/Flight";
import type { Airway, Waypoint, TransitCoords } from "../types/Airway";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8888/api",
});

export const getFlights = async (): Promise<Flight[]> => {
  try {
    const res = await api.get("/flights");
    return res.data;
  } catch (err) {
    console.error("Error fetching flights", err);
    return [];
  }
};

export const getFlightById = async (id: string): Promise<Flight | null> => {
  try {
    const res = await api.get(`/flights/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching flight with ID ${id}`, err);
    return null;
  }
};

export const getFlightsByCallsign = async (
  callsign: string
): Promise<Flight[]> => {
  try {
    const res = await api.get(`/flights/callsign/${callsign}`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching flights with callsign ${callsign}`, err);
    return [];
  }
};

export const getFlightRouteById = async (id: string): Promise<Waypoint[]> => {
  try {
    const res = await api.get(`/flights/id/${id}/routeElements`);
    return res.data.waypoints;
  } catch (err) {
    console.error(`Error fetching flight route by flight id`, err);
    return [];
  }
};

export const getTransitCoordsByID = async (
  id: string
): Promise<TransitCoords | null> => {
  try {
    const res = await api.get(`/flights/id/${id}/transitCoords`);
    return res.data;
  } catch (err) {
    console.error(`Error fetching transit coordinates for flight id`, err);
    return null;
  }
};

export const getAirways = async (): Promise<string[]> => {
  try {
    const res = await api.get("/airways");
    return res.data;
  } catch (err) {
    console.error("Error fetching airways", err);
    return [];
  }
};

export const getAirwayDetails = async (id: string): Promise<Airway> => {
  const res = await api.get(`/geopoints/airways/${id}`);
  return res.data;
};
