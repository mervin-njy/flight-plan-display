export interface Airway {
  id: string;
  waypoints?: Waypoint[];
}

export interface Waypoint {
  designatedPoint: string;
  type: "AIRPORT" | "NAVAID" | "FIX";
  coordinates: {
    latitude: number;
    longitude: number;
  };
}
