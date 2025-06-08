import express, { NextFunction } from "express";
import cors from "cors";
import flightsRouter from "./routes/flights";
import airwaysRouter from "./routes/airways";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/flights", flightsRouter);
app.use("/api/airways", airwaysRouter);

// // Error handling middleware
// app.use(
//   (
//     err: Error,
//     _req: express.Request,
//     res: express.Response,
//     _next: NextFunction
//   ) => {
//     console.error(err.stack);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// );

export default app;
