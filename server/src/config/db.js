const mongoose = require('mongoose');
const config = require('./env');
const logger = require('../utils/logger');

let memoryServer = null;

const connectDB = async () => {
  try {
    // Attempt standard connection (Atlas or local mongod)
    logger.info(`Attempting to connect to MongoDB at: ${config.mongodbUri}`);
    
    // Configure mongoose connection options with a short timeout so fallback triggers promptly in dev
    const options = {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true
    };

    await mongoose.connect(config.mongodbUri, options);
    logger.info('Connected to MongoDB successfully.');
    return mongoose.connection;
  } catch (error) {
    logger.warn(`Could not connect to external MongoDB: ${error.message}`);

    if (config.isProduction) {
      logger.error('CRITICAL: In production mode, a valid MONGODB_URI is required. Exiting process.');
      throw error;
    }

    // In development or test, start MongoMemoryServer as a zero-friction fallback
    logger.info('Starting MongoMemoryServer in-memory instance for development/testing...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const memUri = memoryServer.getUri();
      
      await mongoose.connect(memUri);
      logger.info(`Connected to in-memory MongoDB at: ${memUri}`);
      logger.info('Note: Using in-memory database for local session. To persist across restarts, specify MONGODB_URI in .env');
      return mongoose.connection;
    } catch (memErr) {
      logger.error(`Failed to start in-memory MongoDB fallback: ${memErr.message}`);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    logger.info('Disconnected from MongoDB.');
  } catch (error) {
    logger.error('Error disconnecting MongoDB:', error);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};
