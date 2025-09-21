console.log("Loading: server.js");
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { logger } from "./utils/logger";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import healthRoutes from "./routes/healthRoutes";
import { errorHandler } from "./middlewares/errorMiddleware";


// Debug environment
console.log("🔍 NODE_ENV:", process.env.NODE_ENV);
console.log("🔍 Should connect to DB:", process.env.NODE_ENV !== 'test');

const app = express();

// --------- Middleware ---------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

if (process.env.NODE_ENV === 'production') {
  app.use(
    cors({
      origin: config.allowedOrigins, // only allow your frontend URL
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );
} else {
  // Optional: allow all origins in development
  app.use(cors({ origin: true, credentials: true }));
}


app.use(cookieParser(config.cookieSecret));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

if (config.rateLimit.enabled) {
  app.use(rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.max,
    message: {
      success: false,
      message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }));
} else {
  console.log(`⚡ Rate limiting disabled in ${config.nodeEnv}`);
}



// --------- Database connection ---------
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    logger.info("✅ MongoDB connected successfully");
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// connectDB();
// Only connect to database if NOT in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}
// Only connect automatically if NOT in test environmen
// --------- Routes ---------
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/health", healthRoutes);

// --------- Error handlers ---------
app.use((req, res) => res.status(404).json({ success: false, message: "Not Found" }));
app.use(errorHandler);


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
