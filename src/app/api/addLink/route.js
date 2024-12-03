import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// Reusable MongoClient instance
const client = new MongoClient(
  'mongodb+srv://cloud:AEl0OZPk34Yy8891@cluster0.q0opr.mongodb.net/',
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Ensure the client is connected
async function connectToDatabase() {
  if (!client.isConnected) {
    await client.connect();
  }
  return client.db("cloud");
}

// POST: Add a new link
export async function POST(request) {
  try {
    const { link, siteLink, siteReview, email } = await request.json();

    // if (!email) {
    //   return NextResponse.json({ message: "User not authenticated" }, { status: 401 });
    // }

    const db = await connectToDatabase();
    const linksCollection = db.collection("links");

    const newLink = {
      link,
      siteLink,
      siteReview,
      email,
      createdAt: new Date(),
    };

    const result = await linksCollection.insertOne(newLink);

    if (result.acknowledged) {
      return NextResponse.json({ message: "Link successfully generated" });
    } else {
      return NextResponse.json({ message: "Failed to generate the link" }, { status: 500 });
    }
  } catch (error) {
    console.error("Error adding link:", error);
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

// GET: Fetch all links
export async function GET() {
  try {
    const db = await connectToDatabase();
    const linksCollection = db.collection("links");

    const links = await linksCollection.find({}).toArray();

    return NextResponse.json(links, { status: 200 });
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { message: "Error fetching links", error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Remove a link by ID
export async function DELETE(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ message: "ID is required for deletion" }, { status: 400 });
    }

    const db = await connectToDatabase();
    const linksCollection = db.collection("links");

    const result = await linksCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "No document found with the provided ID" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Link deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { message: "Error deleting link", error: error.message },
      { status: 500 }
    );
  }
}
