import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://cloud:AEl0OZPk34Yy8891@cluster0.q0opr.mongodb.net/';
const client = new MongoClient(uri);

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  return client.db('cloud'); // Replace with your database name
}

export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('mega_personal_login'); // Replace with your collection name

    // Fetch all documents from the collection
    const documents = await collection.find({}).toArray();

    return new Response(
      JSON.stringify({
        success: true,
        data: documents,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching objects:', error.message);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch objects from the database.',
      }),
      { status: 500 }
    );
  }
}
