import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Constants for static pages and revalidation interval
export const dynamic = "force-static";
export const revalidate = 60;

// Helper function to connect to the database
const connectToDatabase = async () => {
  const client = await clientPromise;
  return client.db("cloud");
};

// POST: Delete a user by email
export async function POST(req) {
  try {
    const { email } = await req.json();

    // Input validation
    if (!email) {
      return NextResponse.json(
        { message: "Email is required to delete a user" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Delete the user
    const result = await db.collection("users").deleteOne({ email });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: "User not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { message: "Error deleting user", error: error.message },
      { status: 500 }
    );
  }
}
