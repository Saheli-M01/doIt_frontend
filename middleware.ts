import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  // Get the path the user is trying to access
  const path = request.nextUrl.pathname;

  // If maintenance mode is ON and the user is NOT on the maintenance page, redirect to /maintenance
  if (isMaintenanceMode && path !== "/maintenance") {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }

  // If maintenance mode is OFF and the user IS on the maintenance page, redirect to /
  if (!isMaintenanceMode && path === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Otherwise, allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
