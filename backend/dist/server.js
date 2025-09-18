"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log("Loading: server.js");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const config_1 = require("./config");
const logger_1 = require("./utils/logger");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const errorMiddleware_1 = require("./middlewares/errorMiddleware");
const app = (0, express_1.default)();
// --------- Middleware ---------
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use((0, cors_1.default)({
    origin: config_1.config.allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use((0, cookie_parser_1.default)(config_1.config.cookieSecret));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, morgan_1.default)(config_1.config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use((0, express_rate_limit_1.default)({
    windowMs: config_1.config.rateLimit.windowMs,
    max: config_1.config.rateLimit.max,
    message: {
        success: false,
        message: 'Too many requests, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
}));
// --------- Database connection ---------
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(config_1.config.mongodb.uri);
        logger_1.logger.info("✅ MongoDB connected successfully");
    }
    catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        process.exit(1);
    }
};
connectDB();
// --------- Routes ---------
app.use("/api/auth", authRoutes_1.default);
app.use("/api/tasks", taskRoutes_1.default);
// --------- Health check ---------
app.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "Server is healthy" });
});
// --------- Error handlers ---------
app.use((req, res) => res.status(404).json({ success: false, message: "Not Found" }));
app.use(errorMiddleware_1.errorHandler);
// --------- Start server ---------
const server = app.listen(config_1.config.port, () => {
    logger_1.logger.info(`🚀 Server running on port ${config_1.config.port}`);
});
// --------- Graceful shutdown ---------
const gracefulShutdown = async (signal) => {
    logger_1.logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
        try {
            await mongoose_1.default.connection.close();
            logger_1.logger.info("MongoDB connection closed");
            process.exit(0);
        }
        catch (error) {
            logger_1.logger.error("Error during shutdown:", error);
            process.exit(1);
        }
    });
    setTimeout(() => {
        logger_1.logger.error("Forcefully shutting down after 30s");
        process.exit(1);
    }, 30000);
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("unhandledRejection", (err) => logger_1.logger.error("Unhandled Rejection:", err));
process.on("uncaughtException", (err) => logger_1.logger.error("Uncaught Exception:", err));
exports.default = app;
