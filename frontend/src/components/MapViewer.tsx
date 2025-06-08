import { MapContainer, TileLayer } from "react-leaflet";
// import type { Flight } from "../types/Flight";
// import type { Airway } from "../types/Airway";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

const center: LatLngExpression = [1.3586, 103.9899];
const maxBounds: LatLngBoundsExpression = [
  [-85, -180], // Southwest corner (max latitude, min longitude)
  [85, 180], // Northeast corner (min latitude, max longitude)
];

// interface Props {
//   flights: Flight[];
//   airways: Airway[];
//   selectedCallsign: string | null;
//   hoveredAirway: string | null;
// }
//{ flights, selectedCallsign }: Props
export default function MapViewer() {
  return (
    <MapContainer
      center={center}
      zoom={10}
      minZoom={2}
      maxZoom={14}
      zoomControl={false}
      maxBounds={maxBounds}
      maxBoundsViscosity={1.0}
      className="h-full w-full z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
      />
      {/* TODO: Add polyline rendering here based on selectedCallsign */}
    </MapContainer>
  );
}
