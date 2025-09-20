// Test setup and configuration
import dotenv from "dotenv";

// Load test environment variables
dotenv.config();
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from '../src/config';

let mongoServer: MongoMemoryServer;

// Setup test database
export const setupTestDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
  
  // Override config for testing
  (config as any).mongodb.uri = mongoUri;
};

// Cleanup test database
export const cleanupTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
};

// Clear all collections
export const clearCollections = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Test timeout
export const TEST_TIMEOUT = 30000;
