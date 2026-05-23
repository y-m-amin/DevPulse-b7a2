// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./modules/auth/auth.routes";
import issuesRoutes from "./modules/issues/issues.routes";
import metricsRoutes from "./modules/metrics/metrics.routes";

import { notFoundMiddleware } from "./middlewares/not-found.middleware";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "DevPulse API is running"
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issuesRoutes);
app.use("/api/metrics", metricsRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;

// import express from "express";

// const app = express();

// app.get("/", (_req, res) => {
//   res.json({
//     success: true,
//     message: "Minimal API is running"
//   });
// });

// app.get("/health", (_req, res) => {
//   res.json({
//     success: true,
//     message: "Health OK"
//   });
// });

// export default app;