import { MongoClient } from 'mongodb';

// MongoDB connection URI
const uri = 'mongodb+srv://cloud:AEl0OZPk34Yy8891@cluster0.q0opr.mongodb.net/';
const client = new MongoClient(uri);

// Ensure the MongoClient connects only once for better performance
let isConnected = false;
export const dynamic = "force-static"; // for static pages
export const revalidate = 60; // to specify revalidation interval

// Function to handle database connection
async function connectToDatabase() {
  if (!isConnected) {
    try {
      await client.connect();
      isConnected = true;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error.message);
      throw new Error('Failed to connect to database');
    }
  }
  return client.db('cloud'); // Use the 'cloud' database (or replace with your actual DB name)
}

// GET API route to fetch all documents from 'mega_personal_login' collection
export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('mega_personal_login'); // Replace with your collection name

    // Fetch all documents from the collection
    const documents = await collection.find({}).toArray();

    return new Response(
      JSON.stringify({ success: true, data: documents }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching documents:', error.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch documents from the database.',
        error: error.message,
      }),
      { status: 500 }
    );
  }
}
