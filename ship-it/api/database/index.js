const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'ship-it';

// Use connect method to connect to the server
if (global.getCollection === undefined) {
  MongoClient.connect(url, function(err, client) {
    if (err != undefined) {
      console.error(err);
      process.exit(1);
    }
    console.log("Connected successfully to database.");
    global.getCollection = async function(name) {
      console.log(`Collection ${name} requested. Connected ${client.isConnected()}.`);
      const db = client.db(dbName);
      return await db.collection(name);
    }
  });
}
