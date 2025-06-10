import express, { NextFunction } from "express";
import cors from "cors";
import flightsRouter from "./routes/flights";
import airwaysRouter from "./routes/airways";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/flights", flightsRouter);
app.use("/api/airways", airwaysRouter);

export default app;
