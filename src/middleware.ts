import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require the user to be signed in
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/tasks(.*)",
]);

// Maintenance mode — set to true to redirect everyone to /maintenance
const isMaintenanceMode = false;

export default clerkMiddleware(async (auth, request) => {
  const path = request.nextUrl.pathname;

  // Maintenance mode handling
  if (isMaintenanceMode && path !== "/maintenance") {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }
  if (!isMaintenanceMode && path === "/maintenance") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect dashboard and tasks routes — Clerk will redirect to sign-in if not authenticated
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
