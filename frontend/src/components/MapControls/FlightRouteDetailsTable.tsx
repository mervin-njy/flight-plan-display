import type { Waypoint, TransitCoords } from "../../types/Airway";

interface Props {
  waypoints: Waypoint[];
  transitCoords: TransitCoords | null;
}

export default function FlightRouteDetailsTable({
  waypoints,
  transitCoords,
}: Props) {
  function getWaypointColour(type: string): string {
    if (type === "navaid") return "text-citrus-100";
    if (type === "fix") return "text-lavender-100";
    if (type === "airport") return "text-green-200";
    return "text-gray-300";
  }

  return (
    <div className="mt-2">
      <h3 className="text-sm font-semibold mb-1">Flight Route Details</h3>
      <div className="overflow-y-auto max-h-60">
        <table className="table table-xs w-full">
          <thead>
            <tr className="text-xs text-grey-100">
              <th>#</th>
              <th>Point</th>
              <th>Type</th>
              <th>Lat</th>
              <th>Lon</th>
              <th>Airway</th>
              <th>Speed</th>
              <th>Level</th>
            </tr>
          </thead>
          <tbody>
            {/* DEP row */}
            <tr className="hover">
              <td className="text-red-100">DEP</td>
              <td className="text-red-100">
                {transitCoords?.departure?.designatedPoint || "—"}
              </td>
              <td className="text-red-100">
                {transitCoords?.departure?.type || "—"}
              </td>
              <td className="font-mono text-xs">
                {transitCoords?.departure?.lat !== null
                  ? transitCoords?.departure?.lat.toFixed(4)
                  : "—"}
              </td>
              <td className="font-mono text-xs">
                {transitCoords?.departure?.lon !== null
                  ? transitCoords?.departure?.lon.toFixed(4)
                  : "—"}
              </td>
              <td>{transitCoords?.departure?.airway || "—"}</td>
              <td>{transitCoords?.departure?.changeSpeed || "—"}</td>
              <td>{transitCoords?.departure?.changeLevel || "—"}</td>
            </tr>

            {/* waypoints or no data */}
            {!waypoints || waypoints.length === 0 ? (
              <tr className="italic text-gray-300 text-sm">
                <td colSpan={8} className="text-left">
                  No route data available for this flight.
                </td>
              </tr>
            ) : (
              waypoints.map((wp, i) => (
                <tr key={`${wp.designatedPoint}-${i}`} className="hover">
                  <td>{i + 1}</td>
                  <td>{wp.designatedPoint || "—"}</td>
                  <td className={`${getWaypointColour(wp.type)}`}>
                    {wp.type || "—"}
                  </td>
                  <td className="font-mono text-xs">
                    {wp.lat !== null ? wp.lat.toFixed(4) : "—"}
                  </td>
                  <td className="font-mono text-xs">
                    {wp.lon !== null ? wp.lon.toFixed(4) : "—"}
                  </td>
                  <td>{wp.airway || "—"}</td>
                  <td>{wp.changeSpeed || "—"}</td>
                  <td>{wp.changeLevel || "—"}</td>
                </tr>
              ))
            )}

            {/* ARR row */}
            <tr className="hover">
              <td className="text-green-100">ARR</td>
              <td className="text-green-100">
                {transitCoords?.arrival?.designatedPoint || "—"}
              </td>
              <td className="text-green-100">
                {transitCoords?.arrival?.type || "—"}
              </td>
              <td className="font-mono text-xs">
                {transitCoords?.arrival?.lat !== null
                  ? transitCoords?.arrival?.lat.toFixed(4)
                  : "—"}
              </td>
              <td className="font-mono text-xs">
                {transitCoords?.arrival?.lon !== null
                  ? transitCoords?.arrival?.lon.toFixed(4)
                  : "—"}
              </td>
              <td>{transitCoords?.arrival?.airway || "—"}</td>
              <td>{transitCoords?.arrival?.changeSpeed || "—"}</td>
              <td>{transitCoords?.arrival?.changeLevel || "—"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
