import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export const dynamic = "force-static"; // for static pages
export const revalidate = 60; // specify revalidation interval

export async function POST(req) {
  try {
    // Extract email and role from request body
    const { email, role } = await req.json();

    // Basic validation for email and role
    if (!email || !role) {
      return NextResponse.json(
        { message: "Email and role are required" },
        { status: 400 }
      );
    }

    // Connect to the database
    const client = await clientPromise;
    const db = client.db("cloud");

    // Attempt to update the user's role in the database
    const result = await db
      .collection("users")
      .updateOne({ email }, { $set: { role } });

    // If no document was modified, return an error message
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update role. User may not exist." },
        { status: 400 }
      );
    }

    // Return success message
    return NextResponse.json({
      message: "Role updated successfully",
    });
  } catch (error) {
    // Log and return error details in case of failure
    console.error("Error updating role:", error);
    return NextResponse.json(
      { message: "Error updating role", error: error.message },
      { status: 500 }
    );
  }
}
