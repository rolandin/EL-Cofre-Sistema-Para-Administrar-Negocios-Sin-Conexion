import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

async function verifyAuth(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    throw new Error("Missing token");
  }

  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { userId: number; role: string };
  } catch (err) {
    throw new Error("Invalid token");
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Allow API routes
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Handle setup page
  if (path === "/setup") {
    try {
      const response = await fetch(new URL("/api/check-setup", request.url));
      const data = await response.json();

      if (!data.isFirstRun) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.next();
    } catch (error) {
      console.error("Failed to check setup status:", error);
      return NextResponse.next();
    }
  }

  // Handle login page
  if (path === "/login") {
    const token = request.cookies.get("token")?.value;
    if (token) {
      try {
        await verifyAuth(request);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } catch (error) {
        // Token is invalid, allow access to login page
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protected routes
  if (path.startsWith("/dashboard")) {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      await verifyAuth(request);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
