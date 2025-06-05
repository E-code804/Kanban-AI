// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Verify the NextAuth JWT in the incoming request
  console.log("In middleware");

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no valid token is found, return a 401 response
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Otherwise let the request continue
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
