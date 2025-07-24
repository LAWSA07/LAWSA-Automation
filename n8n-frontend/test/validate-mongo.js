const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://aswalh0707:ASXMZYa5r2KkPHJO@automation.sfe092t.mongodb.net/?retryWrites=true&w=majority&appName=automation';

async function testConnection() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    await client.db().admin().ping();
    console.log('✅ Connection successful!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await client.close();
  }
}

testConnection(); 