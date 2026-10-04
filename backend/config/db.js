const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_canteen';

  try {
    // Attempt connecting to local/specified MongoDB instance first
    const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Local MongoDB connection notice: ${error.message}`);
    console.log('Initializing in-memory MongoDB server instance for zero-config database execution...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`MongoDB connected successfully (In-Memory Server): ${conn.connection.host}`);
    } catch (memError) {
      console.error(`MongoDB Memory Server Error: ${memError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
