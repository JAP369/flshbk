import { NextResponse, type NextRequest } from "next/server";

// Check if Clerk is properly configured with real keys
function isClerkConfigured(): boolean {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  return !!(
    publishableKey &&
    secretKey &&
    !publishableKey.includes("placeholder") &&
    !secretKey.includes("placeholder") &&
    publishableKey.startsWith("pk_") &&
    secretKey.startsWith("sk_")
  );
}

const clerkConfigured = isClerkConfigured();

// Pre-load Clerk middleware only if configured
let clerkMiddlewareFn: ((request: NextRequest) => Promise<NextResponse>) | null = null;

if (clerkConfigured) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server");

  const isProtectedRoute = createRouteMatcher([
    "/trade(.*)",
    "/vault(.*)",
    "/draw(.*)",
    "/meetup(.*)",
    "/profile(.*)",
    "/listings/new(.*)",
    "/leaderboard(.*)",
  ]);

  clerkMiddlewareFn = clerkMiddleware(async (auth: { protect: () => Promise<void> }, req: NextRequest) => {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
  });
}

export default async function middleware(request: NextRequest) {
  // If Clerk is not configured, skip auth entirely
  if (!clerkConfigured || !clerkMiddlewareFn) {
    return NextResponse.next();
  }

  return clerkMiddlewareFn(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
