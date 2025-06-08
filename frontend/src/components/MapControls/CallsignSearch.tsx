import { useState } from "react";
import type { Flight } from "../../types/Flight";

interface Props {
  flights: Flight[];
  onSelect: (callsign: string) => void;
}

export default function CallsignSearch({ flights, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const filtered = flights.filter((f) =>
    f.aircraftIdentification.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="Search Callsign"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input input-bordered w-full"
      />
      {filtered.length > 0 && search.length > 0 && (
        <ul className="menu bg-base-100 rounded-box mt-2 max-h-16 overflow-y-auto">
          {filtered.map((f) => (
            <li key={f._id}>
              <a onClick={() => onSelect(f.aircraftIdentification)}>
                {f.aircraftIdentification}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
