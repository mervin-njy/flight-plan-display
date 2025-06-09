export interface Airway {
  id: string;
  waypoints?: Waypoint[];
}

export interface Waypoint {
  designatedPoint: string;
  type: string;
  lat: number | null;
  lon: number | null;
  seqNum?: number;
  airway?: string;
  airwayType?: string;
  changeLevel?: string;
  changeSpeed?: string;
}
