import express, { NextFunction } from "express";
import cors from "cors";
import flightsRouter from "./routes/flights";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/flights", flightsRouter);

export default app;
