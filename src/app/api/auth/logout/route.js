import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clear the authToken cookie
    const response = NextResponse.json({ message: "Logout successful" });
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure cookies in production
      maxAge: 0, // Expire immediately
      path: '/', // Ensure the cookie is cleared for the entire site
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return new Response(
      JSON.stringify({ message: "Error logging out", error: error.message }),
      { status: 500 }
    );
  }
}
