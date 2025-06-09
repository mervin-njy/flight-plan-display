import { useEffect, useState } from "react";
import type { Flight } from "../../types/Flight";

interface Props {
  flights: Flight[];
  onSelect: (callsign: string | null) => void;
  selectedCallsign?: string | null;
}

export default function CallsignSearch({
  flights,
  onSelect,
  selectedCallsign,
}: Props) {
  // ===== State Management =====
  const [search, setSearch] = useState("");

  const filtered = flights.filter((f) =>
    f.aircraftIdentification.toLowerCase().includes(search.toLowerCase())
  );

  const uniqueCallsigns = Array.from(
    new Set(filtered.map((f) => f.aircraftIdentification))
  );

  // ===== Effects =====
  useEffect(() => {
    if (search.trim() === "") onSelect(null);
  }, [search]);

  return (
    <div>
      <h3 className="font-semibold mb-2">Flight Plan Selection</h3>
      <input
        type="text"
        placeholder="Search Callsign"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input input-sm input-bordered w-[95%] m-1 focus:outline-none focus:ring-2 focus:ring-lavender-200 focus:border-transparent"
      />

      {search.length === 0 || uniqueCallsigns.length === 0 ? (
        <div className="flex items-center text-grey-200 h-16 ml-2 font-light italic text-sm">
          No results found.
        </div>
      ) : (
        <div className="flex items-center overflow-auto gap-1 h-16">
          {uniqueCallsigns.map((cs) => {
            const instanceCount = flights.filter(
              (f) => f.aircraftIdentification === cs
            ).length;
            const isActive = cs === selectedCallsign;

            return (
              <button
                key={cs}
                onClick={() => onSelect(cs)}
                title={`${instanceCount} instance(s)`}
                className={`btn btn-sm whitespace-nowrap text-xs hover:bg-grey-300 hover:text-lavender-100 ${
                  isActive ? "btn-primary" : ""
                }`}
              >
                {cs}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
