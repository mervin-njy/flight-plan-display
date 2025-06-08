import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";
import type { Waypoint } from "../types/Airway";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

const center: LatLngExpression = [1.3586, 103.9899];
const maxBounds: LatLngBoundsExpression = [
  [-85, -180], // Southwest corner (max latitude, min longitude)
  [85, 180], // Northeast corner (min latitude, max longitude)
];

interface Props {
  flightRoute: Waypoint[];
}
//{ flights, selectedCallsign }: Props
export default function MapViewer({ flightRoute }: Props) {
  // ===== Variables =====
  const positions: LatLngBoundsExpression = flightRoute.map((wp) => [
    wp.lat,
    wp.lon,
  ]);

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
      {positions.length > 1 && (
        <Polyline
          positions={positions}
          pathOptions={{ color: "#6c5ce7", weight: 1.5, dashArray: "5,4" }}
        />
      )}

      {flightRoute.map((wp, index) => (
        <CircleMarker
          key={`${wp.designatedPoint}-${index}`}
          center={[wp.lat, wp.lon]}
          radius={4}
          pathOptions={{
            color: "#2d3436",
            fillColor: "#a29bfe",
            fillOpacity: 0.8,
            weight: 1.5,
          }}
        >
          <Popup>
            <div>
              <strong>{wp.designatedPoint}</strong>
              <br />
              Airway: {wp.airway || "N/A"}
              <br />
              Type: {wp.type}
              <br />
              Lat: {wp.lat.toFixed(4)}
              <br />
              Lng: {wp.lon.toFixed(4)}
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
