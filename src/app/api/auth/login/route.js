import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

// Constants for static pages and revalidation interval
export const dynamic = "force-static";
export const revalidate = 60;

// Helper function to handle database connection
const getDbClient = async () => {
  const client = await clientPromise;
  return client.db("cloud");
};

// POST method for login
export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // Input validation
    if (!email || !password) {
      return new NextResponse(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    const db = await getDbClient();

    // Check if the user exists
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    // Validate password (assuming no hashing)
    if (user.password !== password) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    // Return successful login response
    return NextResponse.json({
      message: "Login successful",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error logging in", error: error.message }),
      { status: 500 }
    );
  }
}
