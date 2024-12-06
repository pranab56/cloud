// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  // Protected routes (e.g., /dashboard, /profile, etc.)
  const protectedPaths = ['/home', '/profile'];

  // Check if the current path is protected
  if (protectedPaths.includes(req.nextUrl.pathname)) {
    const token = req.cookies.get('authToken'); // Retrieve the token from cookies

    // If no token exists, redirect the user to the login page
    if (!token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home', '/profile'], // Define all protected routes here
};
