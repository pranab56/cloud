

import { MongoClient } from "mongodb";

// Load MongoDB URI from environment variable for better security
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable.");
}

// Initialize MongoDB client
const client = new MongoClient(MONGODB_URI);

// Initialize MongoDB client promise for connection
let clientPromise;

// Use global variable for client in development mode for persistence across hot reloads
if (process.env.NODE_ENV === "development") {
  // Store client promise globally in development for hot-reloading support
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Direct connection for production environment
  clientPromise = client.connect().catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);  // Exit on error in production
  });
}

// Export the client promise for usage in other parts of the application
export default clientPromise;
