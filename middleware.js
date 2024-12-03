import { NextResponse } from 'next/server';

export function middleware(req) {
  // Get the token from cookies (you can use a package like `cookie` to parse cookies)
  const token = req.cookies.get('authToken');

  // If the user is trying to access a protected route but doesn't have a token, redirect to login
  if (!token && !['/', '/signup'].includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', req.url)); // Redirect to login page
  }

  return NextResponse.next(); // Allow the request to proceed
}

// Apply middleware to all pages except login and signup
export const config = {
  matcher: ['/', '/home', '/profile', '/settings', '/protected/*'], // Add paths you want to protect
};
