import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { config } from "./config.js";
import { authRouter } from "./routes/auth.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { employeesRouter } from "./routes/employees.js";
import { organizationRouter } from "./routes/organization.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { openApiSpec } from "./openapi.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: config.WEB_ORIGIN,
      credentials: true
    })
  );
  app.use(morgan("dev"));
  app.use(cookieParser());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/uploads", express.static("uploads"));

  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));
  app.use("/api/auth", authRouter);
  app.use("/api/employees", employeesRouter);
  app.use("/api/organization", organizationRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
