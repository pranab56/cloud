
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      console.error('Email or password missing');
      return new Response(
        JSON.stringify({ message: "Email and password are required" }),
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("cloud");

    // Check if the user exists
    const user = await db.collection("users").findOne({ email });
    if (!user) {
      console.error('User not found');
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    // Validate password (assuming no hashing)
    if (user.password !== password) {
      console.error('Password mismatch');
      return new Response(
        JSON.stringify({ message: "Invalid email or password" }),
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Login successful",
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('Error during login:', error);
    return new Response(
      JSON.stringify({ message: "Error logging in", error: error.message }),
      { status: 500 }
    );
  }
}
