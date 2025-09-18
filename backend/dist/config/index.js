"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
// src/config/index.ts
const dotenv_1 = __importDefault(require("dotenv"));
const joi_1 = __importDefault(require("joi"));
dotenv_1.default.config();
const envSchema = joi_1.default.object({
    PORT: joi_1.default.number().default(5000),
    MONGODB_URI: joi_1.default.string().uri().required(),
    JWT_SECRET: joi_1.default.string().required(),
    JWT_REFRESH_SECRET: joi_1.default.string().required(),
    RATE_LIMIT_WINDOW_MS: joi_1.default.number().default(15 * 60 * 1000),
    RATE_LIMIT_MAX: joi_1.default.number().default(100),
    ALLOWED_ORIGINS: joi_1.default.string().default("http://localhost:3000"),
    BCRYPT_SALT_ROUNDS: joi_1.default.number().default(12), // Add this
}).unknown();
const { value: env, error } = envSchema.validate(process.env, { abortEarly: false });
if (error) {
    throw new Error(`❌ Invalid environment config: ${error.message}`);
}
exports.config = {
    port: env.PORT,
    mongodb: {
        uri: env.MONGODB_URI,
        options: {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        },
    },
    jwt: {
        secret: env.JWT_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
        accessTokenExpiry: "15m",
        refreshTokenExpiry: "7d",
    },
    rateLimit: {
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        max: env.RATE_LIMIT_MAX,
    },
    allowedOrigins: env.ALLOWED_ORIGINS.split(","),
    bcrypt: {
        saltRounds: env.BCRYPT_SALT_ROUNDS,
    },
};
