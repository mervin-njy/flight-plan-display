import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
  Tooltip,
} from "react-leaflet";
import type { Waypoint, TransitCoords } from "../types/Airway";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

const center: LatLngExpression = [1.3586, 103.9899];
const maxBounds: LatLngBoundsExpression = [
  [-85, -180], // Southwest corner (max latitude, min longitude)
  [85, 180], // Northeast corner (min latitude, max longitude)
];

interface Props {
  flightRoute: Waypoint[];
  transitCoords: TransitCoords | null;
}
export default function MapViewer({ flightRoute, transitCoords }: Props) {
  // ===== DEP & ARR =====
  const positions: LatLngBoundsExpression = flightRoute
    .filter((wp) => wp.lat !== null && wp.lon !== null)
    .map((wp) => [wp.lat!, wp.lon!] as [number, number]);

  const first = positions[0];
  const last = positions[positions.length - 1];

  const canRenderDep =
    transitCoords !== null &&
    transitCoords?.departure?.lat !== null &&
    transitCoords?.departure?.lon !== null;
  const canRenderArr =
    transitCoords !== null &&
    transitCoords?.arrival?.lat !== null &&
    transitCoords?.arrival?.lon !== null;

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

      {/* Main route polyline */}
      {positions.length >= 2 && (
        <Polyline
          positions={positions}
          pathOptions={{ color: "#2d3436", weight: 1.8 }}
        />
      )}

      {/* Main Route markers */}
      {flightRoute
        .filter((wp) => wp.lat !== null && wp.lon !== null)
        .map((wp, index) => (
          <CircleMarker
            key={`${wp.designatedPoint}-${index}`}
            center={[wp.lat!, wp.lon!]}
            radius={4}
            pathOptions={{
              color: "#2d3436",
              fillColor: `${wp.type === "fix" ? "#a29bfe" : "#fdcb6e"}`,
              fillOpacity: 0.8,
              weight: 1.5,
            }}
          >
            {wp.seqNum != null && wp.seqNum >= 0 && (
              <Tooltip direction="top" offset={[0, -8]}>
                <span className="text-xs font-semibold">
                  {wp.seqNum + 1} | {wp.designatedPoint}
                </span>
              </Tooltip>
            )}

            <Popup>
              <div className="text-sm">
                <strong className="h-8">
                  {wp.seqNum != null ? `${wp.seqNum + 1}` : "—"} |{" "}
                  {wp.designatedPoint}
                </strong>
                <div className="flex flex-auto items-start space-x-2 h-6">
                  <p className="font-semibold text-xs w-14">AIRWAY</p>
                  <p className="font-light text-xs w-14">{wp.airway || "—"}</p>

                  <p className="font-semibold text-xs w-10">LAT</p>
                  <p className="font-light text-xs w-14">
                    {wp.lat!.toFixed(4)}
                  </p>
                </div>
                <div className="flex flex-auto items-start space-x-2 h-8">
                  <p className="font-semibold text-xs w-14">TYPE</p>
                  <p className="font-light text-xs w-14">{wp.type}</p>

                  <p className="font-semibold text-xs w-10">LON</p>
                  <p className="font-light text-xs w-14">
                    {wp.lon!.toFixed(4)}
                  </p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {/* Departure marker and line */}
      {canRenderDep && (
        <>
          <CircleMarker
            center={[
              transitCoords?.departure?.lat!,
              transitCoords?.departure?.lon!,
            ]}
            radius={5}
            pathOptions={{
              color: "#2d3436",
              fillColor: "#fd79a8",
              fillOpacity: 0.9,
              weight: 1.5,
            }}
          >
            <Popup>
              <strong>DEP | {transitCoords?.departure?.designatedPoint}</strong>
            </Popup>
          </CircleMarker>

          {positions.length > 0 && (
            <Polyline
              positions={[
                [
                  transitCoords?.departure?.lat!,
                  transitCoords?.departure?.lon!,
                ],
                first,
              ]}
              pathOptions={{ color: "#d63031", weight: 1.5, dashArray: "4,4" }}
            />
          )}
        </>
      )}

      {/* Arrival marker and line */}
      {canRenderArr && (
        <>
          <CircleMarker
            center={[
              transitCoords?.arrival?.lat!,
              transitCoords?.arrival?.lon!,
            ]}
            radius={5}
            pathOptions={{
              color: "#2d3436",
              fillColor: "#00b894",
              fillOpacity: 0.9,
              weight: 1.5,
            }}
          >
            <Popup>
              <strong>ARR | {transitCoords?.arrival?.designatedPoint}</strong>
            </Popup>
          </CircleMarker>

          {positions.length > 0 && (
            <Polyline
              positions={[
                last,
                [transitCoords?.arrival?.lat!, transitCoords?.arrival?.lon!],
              ]}
              pathOptions={{ color: "#036e59", weight: 2, dashArray: "4,4" }}
            />
          )}
        </>
      )}

      {/* If no waypoints, draw straight line */}
      {positions.length === 0 && canRenderDep && canRenderArr && (
        <Polyline
          positions={[
            [transitCoords?.departure?.lat!, transitCoords?.departure?.lon!],
            [transitCoords?.arrival?.lat!, transitCoords?.arrival?.lon!],
          ]}
          pathOptions={{ color: "#2d3436", weight: 1.5, dashArray: "4,4" }}
        />
      )}
    </MapContainer>
  );
}
