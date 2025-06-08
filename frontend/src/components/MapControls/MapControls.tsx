import CallsignSearch from "./CallsignSearch";
import AirwayListings from "./AirwayListings";
import type { Flight } from "../../types/Flight";
import type { Airway } from "../../types/Airway";

interface Props {
  flights: Flight[];
  airways: Airway[];
  onSelectCallsign: (callsign: string) => void;
  onHoverAirway: (airwayId: string | null) => void;
}

export default function MapControls({
  flights,
  airways,
  onSelectCallsign,
  onHoverAirway,
}: Props) {
  return (
    <div className="absolute top-4 left-4 z-1 bg-base-100 opacity-70 p-4 rounded shadow w-[350px] space-y-4">
      <AirwayListings airways={airways} onHover={onHoverAirway} />
      <CallsignSearch flights={flights} onSelect={onSelectCallsign} />
    </div>
  );
}
