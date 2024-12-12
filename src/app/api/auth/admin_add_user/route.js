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

// POST: Create a new user
export async function POST(req) {
  try {
    const { email, password, name, role } = await req.json();

    // Basic validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { message: "Email, name, role, and password are required" },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();

    // Check if the user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 400 }
      );
    }

    // Create a new user
    const newUser = {
      email,
      password,
      name,
      role,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    if (result.acknowledged) {
      return NextResponse.json(
        { message: "User created successfully" },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: "Failed to create user" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Error creating account", error: error.message },
      { status: 500 }
    );
  }
}
