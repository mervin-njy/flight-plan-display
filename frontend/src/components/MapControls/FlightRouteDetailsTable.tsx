import type { Waypoint } from "../../types/Airway";

interface Props {
  waypoints: Waypoint[];
}

export default function FlightRouteDetailsTable({ waypoints }: Props) {
  if (!waypoints || waypoints.length === 0) {
    return (
      <div className="flex items-center text-grey-200 h-16 ml-2 font-light italic text-sm">
        No route data available for this flight.
      </div>
    );
  }

  return (
    <div className="mt-2">
      <h3 className="text-sm font-semibold mb-1">Flight Route Details</h3>
      <div className="overflow-y-auto max-h-40">
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
            {waypoints.map((wp, i) => (
              <tr key={`${wp.designatedPoint}-${i}`} className="hover">
                <td>{i + 1}</td>
                <td>{wp.designatedPoint || "—"}</td>
                <td>{wp.type || "—"}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
