console.log("Loading: server.js");
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { logger } from "./utils/logger";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import { errorHandler } from "./middlewares/errorMiddleware";

const app = express();

// --------- Middleware ---------
app.use(helmet());
app.use(cors({ origin: ["http://localhost:3000"], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
}));

// Routes
app.use("/api/tasks", taskRoutes);

// --------- Health check ---------
app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is healthy" });
});

// --------- Database connection ---------
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);
// Mounted under /api/tasks above


// --------- Error handlers ---------
app.use((req, res) => res.status(404).json({ success: false, message: "Not Found" }));
app.use((err: any, req: any, res: any, next: any) => {
  logger.error("Global Error:", err);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// Error middleware (last)
// app.use(errorHandler);


// --------- Start server ---------
const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
});

// --------- Graceful shutdown ---------
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
      logger.info("MongoDB connection closed");
      process.exit(0);
    } catch (error) {
      logger.error("Error during shutdown:", error);
      process.exit(1);
    }
  });

  setTimeout(() => {
    logger.error("Forcefully shutting down after 30s");
    process.exit(1);
  }, 30000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("unhandledRejection", (err: any) => logger.error("Unhandled Rejection:", err));
process.on("uncaughtException", (err: any) => logger.error("Uncaught Exception:", err));

export default app;
