import axios from "axios";
import { Flight } from "../models/Flight";

const api = axios.create({
  baseURL: process.env.API_URI,
  headers: { apikey: process.env.API_KEY },
});

export async function fetchFlights(): Promise<Flight[]> {
  try {
    const { data } = await api.get<Flight[]>("/flight-manager/displayAll");
    return data;
  } catch (err: any) {
    console.error("Upstream API failed:", err?.response?.data || err);
    throw err;
  }
}

export async function fetchAirways(): Promise<string[]> {
  try {
    const { data } = await api.get<string[]>("/geopoints/list/airways");
    return data;
  } catch (err: any) {
    console.error("Upstream API failed:", err?.response?.data || err);
    throw err;
  }
}
