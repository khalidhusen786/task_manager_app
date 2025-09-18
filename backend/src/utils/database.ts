// src/utils/database.ts
import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from './logger';

export class Database {
  private static instance: Database;

  private constructor() {}

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    try {
      mongoose.set('strictQuery', false);
      
      await mongoose.connect(config.mongodb.uri, config.mongodb.options);
      
      logger.info('MongoDB connected successfully');
      
      // Handle connection events
      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      process.on('SIGINT', async () => {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      });

    } catch (error) {
      logger.error('Database connection failed:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    await mongoose.connection.close();
  }
}