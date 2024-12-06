import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required to delete a user" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cloud");

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
