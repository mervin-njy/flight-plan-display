import { useEffect, useState } from "react";
import {
  getFlights,
  getAirways,
  getFlightRouteById,
  getTransitCoordsByID,
} from "./services/flightManager";
import type { Flight } from "./types/Flight";
import type { Airway, Waypoint, TransitCoords } from "./types/Airway";
import MapViewer from "./components/MapViewer";
import MapControls from "./components/MapControls/MapControls";

export default function App() {
  // ===== State Management =====
  const [flights, setFlights] = useState<Flight[]>([]);
  const [flightRoute, setFlightRoute] = useState<Waypoint[]>([]);
  const [transitCoords, setTransitCoords] = useState<TransitCoords | null>(
    null
  );
  const [airways, setAirways] = useState<Airway[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);
  const [hoveredAirway, setHoveredAirway] = useState<string | null>(null);

  // ===== Effects =====
  useEffect(() => {
    getFlights().then(setFlights).catch(console.error);

    getAirways()
      .then(async (ids) => {
        const airways: Airway[] = ids.map((id) => ({ id }));
        setAirways(airways);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (hoveredAirway) {
      console.log(`Hovered airway: ${hoveredAirway}`);
    }
  }, [hoveredAirway]);

  // ===== Event Handlers =====
  const handleSelectFlightId = (flightId: string) => {
    setSelectedFlightId(flightId);
    getFlightRouteById(flightId).then(setFlightRoute).catch(console.error);
    getTransitCoordsByID(flightId).then(setTransitCoords).catch(console.error);
  };

  return (
    <div className="h-screen w-screen relative">
      <MapViewer flightRoute={flightRoute} transitCoords={transitCoords} />

      <MapControls
        flights={flights}
        selectedFlightId={selectedFlightId}
        flightRoute={flightRoute}
        airways={airways}
        onSelectFlightId={handleSelectFlightId}
        onHoverAirway={setHoveredAirway}
      />
    </div>
  );
}
