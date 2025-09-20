"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_TIMEOUT = exports.clearCollections = exports.cleanupTestDB = exports.setupTestDB = void 0;
// Test setup and configuration
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
const config_1 = require("../src/config");
let mongoServer;
// Setup test database
const setupTestDB = async () => {
    mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose_1.default.connect(mongoUri);
    // Override config for testing
    config_1.config.mongodb.uri = mongoUri;
};
exports.setupTestDB = setupTestDB;
// Cleanup test database
const cleanupTestDB = async () => {
    if (mongoose_1.default.connection.readyState !== 0) {
        await mongoose_1.default.connection.dropDatabase();
        await mongoose_1.default.connection.close();
    }
    if (mongoServer) {
        await mongoServer.stop();
    }
};
exports.cleanupTestDB = cleanupTestDB;
// Clear all collections
const clearCollections = async () => {
    const collections = mongoose_1.default.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};
exports.clearCollections = clearCollections;
// Test timeout
exports.TEST_TIMEOUT = 30000;
