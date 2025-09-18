"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
// src/utils/database.ts
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("../config");
const logger_1 = require("./logger");
class Database {
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        try {
            mongoose_1.default.set('strictQuery', false);
            await mongoose_1.default.connect(config_1.config.mongodb.uri, config_1.config.mongodb.options);
            logger_1.logger.info('MongoDB connected successfully');
            // Handle connection events
            mongoose_1.default.connection.on('error', (error) => {
                logger_1.logger.error('MongoDB connection error:', error);
            });
            mongoose_1.default.connection.on('disconnected', () => {
                logger_1.logger.warn('MongoDB disconnected');
            });
            process.on('SIGINT', async () => {
                await mongoose_1.default.connection.close();
                logger_1.logger.info('MongoDB connection closed through app termination');
                process.exit(0);
            });
        }
        catch (error) {
            logger_1.logger.error('Database connection failed:', error);
            process.exit(1);
        }
    }
    async disconnect() {
        await mongoose_1.default.connection.close();
    }
}
exports.Database = Database;
