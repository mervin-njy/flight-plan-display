import { useState } from "react";
import AirwayListings from "./AirwayListings";
import CallsignSearch from "./CallsignSearch";
import FlightInstanceTabs from "./FlightInstanceTabs";
import FlightRouteDetailsTable from "./FlightRouteDetailsTable";
import type { Flight } from "../../types/Flight";
import type { Airway, Waypoint } from "../../types/Airway";

interface Props {
  flights: Flight[];
  selectedFlightId: string | null;
  flightRoute: Waypoint[];
  airways: Airway[];
  onSelectFlightId: (id: string) => void;
  onHoverAirway: (airwayId: string | null) => void;
}

export default function MapControls({
  flights,
  selectedFlightId,
  flightRoute,
  airways,
  onSelectFlightId,
  onHoverAirway,
}: Props) {
  // ===== State Management =====
  const [selectedCallsign, setSelectedCallsign] = useState<string | null>(null);

  const matchingFlights = selectedCallsign
    ? flights.filter((f) => f.aircraftIdentification === selectedCallsign)
    : [];

  return (
    <div className="absolute top-4 left-4 right-4 md:bottom-4 z-10 bg-base-100 rounded-xl shadow flex flex-col py-2 px-4 md:p-5 max-w-[calc(100vh-2rem)] md:w-[25rem] max-h-[calc(25vh)] md:max-h-[calc(100vh-2rem)] opacity-95 overflow-auto">
      <div className="flex flex-col gap-2">
        <AirwayListings airways={airways} onHover={onHoverAirway} />

        <CallsignSearch
          flights={flights}
          onSelect={setSelectedCallsign}
          selectedCallsign={selectedCallsign}
        />

        <div className="flex items-center h-16">
          {matchingFlights.length > 0 ? (
            <FlightInstanceTabs
              flights={matchingFlights}
              onSelect={onSelectFlightId}
              selectedFlightId={selectedFlightId}
            />
          ) : (
            <div className="text-grey-200 ml-2 font-light italic text-sm">
              No flights found for selected callsign.
            </div>
          )}
        </div>

        {flightRoute && <FlightRouteDetailsTable waypoints={flightRoute} />}
      </div>
    </div>
  );
}
