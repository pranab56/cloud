// /app/api/get-visit-counts/route.js
import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://cloud:AEl0OZPk34Yy8891@cluster0.q0opr.mongodb.net/";
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const db = client.db('cloud');
    const collection = db.collection('device_count');

    const data = await collection.find({}).toArray();

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error }), { status: 500 });
  } finally {
    await client.close();
  }
}
