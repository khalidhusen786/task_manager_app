// src/config/index.ts
import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envSchema = Joi.object({
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: Joi.number().default(100),
  ALLOWED_ORIGINS: Joi.string().default("http://localhost:3000"),
  BCRYPT_SALT_ROUNDS: Joi.number().default(12), // Add this

}).unknown();

const { value: env, error } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`❌ Invalid environment config: ${error.message}`);
}

interface BcryptConfig {
  saltRounds: number;
}

interface MongoDBConfig {
  uri: string;
  options: object;
}

interface JWTConfig {
  secret: string;
  refreshSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

interface AppConfig {
  port: number;
  mongodb: MongoDBConfig;
  jwt: JWTConfig;
  rateLimit: RateLimitConfig;
  allowedOrigins: string[];
  bcrypt: BcryptConfig; // Add this

}

export const config: AppConfig = {
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
    secret: env.JWT_SECRET as string,
    refreshSecret: env.JWT_REFRESH_SECRET as string,
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
