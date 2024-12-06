import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, role } = await req.json();

    if (!email || !role) {
      return NextResponse.json(
        { message: "Email and role are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cloud");

    // Update the user's role
    const result = await db
      .collection("users")
      .updateOne({ email }, { $set: { role } });

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Failed to update role. User may not exist." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { message: "Error updating role", error: error.message },
      { status: 500 }
    );
  }
}
