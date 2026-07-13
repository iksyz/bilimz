import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "experimental-edge";

export function middleware(request: NextRequest) {
  // Let everything pass through. 
  // IMPORTANT: Since we removed the localhost check, ensure you have authentication in place if needed!
  return NextResponse.next();
}

// Config to target all admin and API posts endpoints
export const config = {
  matcher: [
    "/admin/:path*", 
    "/api/admin/:path*", 
    "/api/posts/:path*"
  ],
};
