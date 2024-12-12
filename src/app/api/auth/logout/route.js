import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Clear the authToken cookie by setting an empty value and expiry
    const response = NextResponse.json({ message: "Logout successful" });

    // Set the cookie to expire immediately
    response.cookies.set('authToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure cookies in production
      maxAge: 0, // Expire the cookie immediately
      path: '/', // Ensure the cookie is cleared across the entire site
    });

    return response;
  } catch (error) {
    console.error("Error during logout:", error);
    return new NextResponse(
      JSON.stringify({ message: "Error logging out", error: error.message }),
      { status: 500 }
    );
  }
}
