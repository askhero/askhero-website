import "dotenv/config";
import http from "node:http";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import dealRoutes from "./routes/deals.js";
import offerRoutes from "./routes/offers.js";
import negotiationRoutes from "./routes/negotiations.js";
import agentRoutes from "./routes/agents.js";
import aiRoutes from "./routes/ai.js";
import propertyRoutes from "./routes/properties.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { setSocketServer } from "./services/socketService.js";
import { registerDealSocket } from "./socket/dealSocket.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "http://localhost:5173" }
});

setSocketServer(io);
registerDealSocket(io);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/properties", propertyRoutes);
app.use(errorHandler);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`AskHero Deal Room API listening on http://localhost:${port}`);
});
