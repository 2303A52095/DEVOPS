const mongoose = require('mongoose');

const isMongoEnabled =
  process.env.DISABLE_MONGODB !== 'true' &&
  Boolean(process.env.MONGODB_URI) &&
  !process.env.MONGODB_URI.includes('YOUR_CLUSTER.mongodb.net');

const connectDB = async () => {
  if (!isMongoEnabled) {
    console.log('MongoDB disabled. Starting NexGoRide without database connection.');
    return false;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    return true;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
};

module.exports = connectDB;
module.exports.isMongoEnabled = isMongoEnabled;
