import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb'; // Assuming this is a reusable DB client for connection pooling

// Force dynamic behavior (no static export)
export const dynamic = "force-dynamic"; // for static pages
export const revalidate = 60; // to specify revalidation interval

// GET: Fetch all records from mega_personal_login collection
export async function GET() {
  try {
    // Reuse MongoDB connection using clientPromise
    const client = await clientPromise;
    const db = client.db('cloud');
    const collection = db.collection('mega_personal_login');

    // Fetch all data from the collection
    const data = await collection.find({}).toArray();

    // Return the data in JSON format
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    // Handle errors gracefully
    console.error("Error fetching data:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500 }
    );
  }
}

// DELETE: Delete a user by ID from the mega_personal_login collection
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ message: "ID is required for deletion" }),
        { status: 400 }
      );
    }

    // Reuse MongoDB connection using clientPromise
    const client = await clientPromise;
    const db = client.db('cloud');
    const collection = db.collection('mega_personal_login');

    // Delete the document by ObjectId
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return new Response(
        JSON.stringify({ message: "No document found with the provided ID" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: "Link deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting document:", error);
    return new Response(
      JSON.stringify({ message: "Error deleting document", error: error.message }),
      { status: 500 }
    );
  }
}
