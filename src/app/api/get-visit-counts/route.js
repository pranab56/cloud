import clientPromise from '@/lib/mongodb'; // Assuming clientPromise is a reusable DB client

// Force dynamic behavior (no static export)
export const dynamic = "force-dynamic"; // for static pages
export const revalidate = 60; // to specify revalidation interval

// GET: Fetch visit counts
export async function GET() {
  let client;

  try {
    // Reuse the client connection via clientPromise
    client = await clientPromise;
    const db = client.db('cloud');
    const collection = db.collection('device_count');

    // Fetch data from the collection
    const data = await collection.find({}).toArray();

    // Return data as a JSON response
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    // Log the error and return a failure response
    console.error("Error fetching visit counts:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}
