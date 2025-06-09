import express, { Request, Response, NextFunction } from "express";
import { fetchFlights } from "../services/flightManager";
import { Flight } from "../models/Flight";
import { TransitCoords, Waypoint } from "../models/Airway";
import { getRouteElementsById } from "../services/routeService";
import { getDepartureArrivalCoordsById } from "../services/airportService";

const router = express.Router();

type paramID = { id: string };
type paramCallsign = { cs: string };

// GET /api/flights
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const flights: Flight[] | undefined = await fetchFlights();

    if (!flights || flights.length === 0) {
      res.status(404).json({ error: "No flights found" });
      return;
    }
    res.json(flights);
  } catch (err) {
    next(err);
  }
});

// GET /api/flights/:id
router.get(
  "/:id",
  async (req: Request<paramID>, res: Response, next: NextFunction) => {
    try {
      const flights: Flight[] | undefined = await fetchFlights();
      const flight: Flight | undefined = flights.find(
        (f) => f._id === req.params.id
      );

      if (!flight) {
        res.status(404).json({ error: "Flight not found" });
        return;
      }
      res.json(flight);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/callsign/:cs",
  async (req: Request<paramCallsign>, res: Response, next: NextFunction) => {
    try {
      const flights: Flight[] | undefined = await fetchFlights();
      const filtered: Flight[] | undefined = flights.filter((f) =>
        f.aircraftIdentification
          .toUpperCase()
          .includes(req.params.cs.toUpperCase())
      );

      if (filtered.length === 0) {
        res.status(404).json({ error: "No flights found with that callsign" });
        return;
      }
      res.json(filtered);
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/id/:id/routeElements",
  async (
    req: Request<paramID>,
    res: Response<{ waypoints: Waypoint[] }>,
    next: NextFunction
  ) => {
    try {
      const waypoints: Waypoint[] = await getRouteElementsById(req.params.id);
      res.json({ waypoints });
    } catch (err: any) {
      next(err);
    }
  }
);

router.get(
  "/id/:id/transitCoords",
  async (req: Request<paramID>, res: Response, next: NextFunction) => {
    try {
      const transitCoords: TransitCoords | null =
        await getDepartureArrivalCoordsById(req.params.id);
      if (!transitCoords?.departure || !transitCoords?.arrival) {
        res
          .status(404)
          .json({ error: "Flight transit information not found." });
        return;
      }
      res.json(transitCoords);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
