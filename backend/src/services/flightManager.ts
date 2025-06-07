import axios from "axios";
import { Flight } from "../models/Flight";

const api = axios.create({
  baseURL: process.env.API_URI,
  headers: { apikey: process.env.API_KEY },
});

export async function fetchFlights(): Promise<Flight[]> {
  const { data } = await api.get<Flight[]>("/flight-manager/displayAll");
  return data;
}
