// Test setup and configuration
process.env.MONGODB_URI = "mongodb+srv://khalidhusen000_db_user:ywTPkQSZqylD0eLY@cluster0.nhgcnah.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
process.env.COOKIE_SECRET = "15d9cb45c27d7d346f4af8df181ba581291abc3f70ac5e4a2119d5ae187a99ffae687a43955c39985a2f3361881648cb18681c5a38b35e0c205d147c13f3e3dc";
process.env.JWT_SECRET = "f3b9c2a1d5e7f8a1234b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8";
process.env.JWT_REFRESH_SECRET = "a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7"
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
