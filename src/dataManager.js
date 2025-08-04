// src/dataManager.js
const { MongoClient } = require('mongodb');

let client = null;
const dbName = 'tnp_scraper';

async function getClient() {
  if (!client) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI environment variable is required');
    }
    
    const options = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      w: 'majority'
    };
    
    client = new MongoClient(uri, options);
    
    try {
      await client.connect();
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      client = null;
      throw error;
    }
  }
  return client;
}

// Add a retry mechanism to the readData function
async function readData(collectionName) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const mongoClient = await getClient();
      const db = mongoClient.db(dbName);
      const collection = db.collection(collectionName);
      
      const latestDoc = await collection.findOne({}, { sort: { _id: -1 } });
      
      if (latestDoc && latestDoc.data) {
        return latestDoc.data;
      }
      return [];
    } catch (error) {
      retryCount++;
      console.error(`Error reading data from collection ${collectionName} (attempt ${retryCount}/${maxRetries}):`, error.message);
      
      if (retryCount === maxRetries) {
        console.error(`Failed to read data from ${collectionName} after ${maxRetries} attempts`);
        throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }
  return [];
}

async function writeData(collectionName, data) {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const mongoClient = await getClient();
      const db = mongoClient.db(dbName);
      const collection = db.collection(collectionName);
      
      await collection.replaceOne(
        { _id: 'latest' },
        { 
          _id: 'latest',
          data: data,
          timestamp: new Date()
        },
        { upsert: true }
      );
      console.log(`Data written successfully to collection ${collectionName}`);
      return;
    } catch (error) {
      retryCount++;
      console.error(`Error writing data to collection ${collectionName} (attempt ${retryCount}/${maxRetries}):`, error.message);
      
      if (retryCount === maxRetries) {
        console.error(`Failed to write data to ${collectionName} after ${maxRetries} attempts`);
        throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
  }
}

async function closeConnection() {
  if (client) {
    try {
      await client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error.message);
    }
    client = null;
  }
}

module.exports = { readData, writeData, closeConnection };