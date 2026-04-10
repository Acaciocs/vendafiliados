import "dotenv/config";
import cors from "cors";
import express from "express";
import apiRoutes from "./routes/api.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.use("/api", apiRoutes);

app.listen(port, () => {
  console.log(`PromoPilot API listening on http://localhost:${port}`);
});
