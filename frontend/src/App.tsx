import { useEffect, useState } from "react";
import { getFlights, getAirways } from "./services/flightManager";
import type { Flight } from "./types/Flight";
import type { Airway } from "./types/Airway";
import MapViewer from "./components/MapViewer";
import MapControls from "./components/MapControls/MapControls";

export default function App() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [airways, setAirways] = useState<Airway[]>([]);
  const [selectedCallsign, setSelectedCallsign] = useState<string | null>(null);
  const [hoveredAirway, setHoveredAirway] = useState<string | null>(null);

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
    if (selectedCallsign) {
      console.log(`Selected callsign: ${selectedCallsign}`);
    }
  }, [selectedCallsign]);

  useEffect(() => {
    if (hoveredAirway) {
      console.log(`Hovered airway: ${hoveredAirway}`);
    }
  }, [hoveredAirway]);

  return (
    <div className="h-screen w-screen relative">
      <MapViewer
      // flights={flights}
      // airways={airways}
      // selectedCallsign={selectedCallsign}
      // hoveredAirway={hoveredAirway}
      />
      <MapControls
        flights={flights}
        airways={airways}
        onSelectCallsign={setSelectedCallsign}
        onHoverAirway={setHoveredAirway}
      />
    </div>
  );
}
