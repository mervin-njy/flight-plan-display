import express, { Request, Response, NextFunction } from "express";
import { fetchAirways } from "../services/flightManager";

const router = express.Router();

// GET /api/airways
router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const airways: string[] | undefined = await fetchAirways();
    res.json(airways);
  } catch (err) {
    next(err);
  }
});

export default router;
