// test-connection.js
const { MongoClient } = require('mongodb');

async function testConnection() {
  try {
    const uri = 'mongodb+srv://safebiteuser:aditya@cluster0.it7rvya.mongodb.net/safebite?retryWrites=true&w=majority';
    console.log('Attempting to connect to MongoDB at:', uri);
    
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB successfully');
    
    const db = client.db('safebite');
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    await client.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

testConnection();
