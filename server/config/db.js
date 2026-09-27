const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongodInstance = null;

const connectDB = async () => {
  let uri = process.env.MONGODB_URI;

  if (uri) {
    try {
      console.log(`Connecting to MongoDB at configured URI...`);
      await mongoose.connect(uri);
      console.log('Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.warn('Failed to connect to configured MONGODB_URI:', err.message);
    }
  }

  // Try standard local MongoDB
  try {
    console.log('Attempting connection to local MongoDB (mongodb://127.0.0.1:27017/clinic_care)...');
    await mongoose.connect('mongodb://127.0.0.1:27017/clinic_care', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('Connected to local MongoDB successfully.');
    return;
  } catch (err) {
    console.log('Local MongoDB not available. Starting in-memory MongoDB server...');
  }

  // Fallback to embedded MongoMemoryServer with persistent disk storage
  try {
    const path = require('path');
    const fs = require('fs');
    const dbPath = path.resolve(__dirname, '../mongodb_data');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbPath,
        storageEngine: 'wiredTiger'
      }
    });
    uri = mongodInstance.getUri();
    await mongoose.connect(uri);
    console.log(`Persistent MongoDB server running and connected at ${uri} (dbPath: ${dbPath})`);
  } catch (err) {
    console.warn('Persistent storage engine notice, falling back to standard instance:', err.message);
    try {
      mongodInstance = await MongoMemoryServer.create();
      uri = mongodInstance.getUri();
      await mongoose.connect(uri);
      console.log(`Embedded MongoDB server running and connected at ${uri}`);
    } catch (e) {
      console.error('Error starting MongoDB:', e);
      throw e;
    }
  }
};

const closeDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
