import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { config } from "./config.js";
import { AppError } from "./utils/errors.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";
import staffRoutes from "./routes/staff.js";
import quizRoutes from "./routes/quizzes.js";
import joinRoutes from "./routes/join.js";
import participantRoutes from "./routes/participant.js";
import resultsRoutes from "./routes/results.js";
import analyticsRoutes from "./routes/analytics.js";
import activityRoutes from "./routes/activity.js";
import settingsRoutes from "./routes/settings.js";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false });
app.use("/api/auth/login", loginLimiter);

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "MEIGAME API" }));
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/join", joinRoutes);
app.use("/api/participant", participantRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/settings", settingsRoutes);

app.use((_req, _res, next) => next(new AppError(404, "Route not found.")));
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err instanceof AppError ? err.status : 500;
  const message = err instanceof Error ? err.message : "Internal server error.";
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => console.log(`MEIGAME API listening on http://localhost:${config.port}`));
}
