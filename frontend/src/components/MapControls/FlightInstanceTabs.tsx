import type { Flight } from "../../types/Flight";

interface Props {
  flights: Flight[];
  onSelect: (flightId: string) => void;
  selectedFlightId: string | null;
}

export default function FlightInstanceTabs({
  flights,
  onSelect,
  selectedFlightId,
}: Props) {
  const sortedFlights = [...flights].sort(
    (a, b) =>
      new Date(b.lastUpdatedTimeStamp).getTime() -
      new Date(a.lastUpdatedTimeStamp).getTime()
  );

  return (
    <div className="overflow-auto">
      {/* <h3 className="text-sm font-semibold">Flight Instances</h3> */}
      <div className="flex items-center overflow-auto gap-1 h-16">
        {sortedFlights.map((f) => {
          const date = new Date(f.lastUpdatedTimeStamp);
          const yymmdd = date.toISOString().slice(2, 10).replace(/-/g, ""); // e.g. "240920"
          const time = date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          const label = `${yymmdd} ${time}`;

          const fullTime = new Date(f.lastUpdatedTimeStamp).toLocaleString();
          const isActive = f._id === selectedFlightId;

          return (
            <button
              key={f._id}
              onClick={() => onSelect(f._id)}
              title={fullTime}
              className={`btn btn-sm whitespace-nowrap text-xs ${
                isActive
                  ? "btn-primary"
                  : "hover:bg-grey-300 hover:text-lavender-100"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
