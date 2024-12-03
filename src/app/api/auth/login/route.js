import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { serialize } from 'cookie'; 

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
    const sessionToken = 'JhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NSIsInVzZXJuYW1lIjoiam9obiIsImlhdCI6MTY4NzA0ODgxNiwiZXhwIjoxNjg3MDU0NDE2fQ.XuS6G_93T_0wvzUlZ-0ffvnwH5xwpxUV5GT8VrtZt5Y'; // Replace this with actual token logic

    // Set the token in the cookies (this could be a JWT for real-world apps)
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set('authToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure cookies in production
      maxAge: 60 * 60 * 24, // Expires in 1 day
    });

    return response;


  } catch (error) {
    console.error('Error during login:', error);
    return new Response(
      JSON.stringify({ message: "Error logging in", error: error.message }),
      { status: 500 }
    );
  }
}
