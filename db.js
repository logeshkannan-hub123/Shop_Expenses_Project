import { MongoClient } from "mongodb";

// Replace with your MongoDB connection string
const uri = "mongodb://localhost:27017/log_database";
const client = new MongoClient(uri);

let dbConnection;

const connectToServer = async () => {
  try {
    await client.connect();
    dbConnection = client.db("log_database"); // Replace 'log_database' with your desired database name
    console.log("Successfully connected to MongoDB.");
    return dbConnection;
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    throw err;
  }
};

const getDb = () => {
  if (!dbConnection) {
    throw new Error("Database not connected. Call connectToServer first.");
  }
  return dbConnection;
};

const closeDb = async () => {
  await client.close();
  console.log("MongoDB connection closed.");
};

export { connectToServer, getDb, closeDb };

// module.exports = {
//   connectToServer: async function () {
//     try {
//       await client.connect();
//       dbConnection = client.db("log_database"); // Replace 'log_database' with your desired database name
//       console.log("Successfully connected to MongoDB.");
//       return dbConnection;
//     } catch (err) {
//       console.error("Failed to connect to MongoDB", err);
//       throw err;
//     }
//   },

//   getDb: function () {
//     if (!dbConnection) {
//       throw new Error("Database not connected. Call connectToServer first.");
//     }
//     return dbConnection;
//   },

//   closeDb: async function () {
//     await client.close();
//     console.log("MongoDB connection closed.");
//   },
// };
