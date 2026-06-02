import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  // Only allow when Clerk is NOT configured (dev bypass mode)
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const clerkConfigured =
    publishableKey &&
    secretKey &&
    !publishableKey.includes("placeholder") &&
    !secretKey.includes("placeholder") &&
    publishableKey.startsWith("pk_") &&
    secretKey.startsWith("sk_");

  if (clerkConfigured) {
    return NextResponse.json(
      { error: "Clerk is configured — use normal login" },
      { status: 400 }
    );
  }

  // Create a mock dev session
  const response = NextResponse.redirect(new URL("/", request.url));

  // Set a dev session cookie that our auth context can detect
  response.cookies.set("dev_session", "authenticated", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  // Set a dev user cookie with mock profile data
  response.cookies.set(
    "dev_user",
    encodeURIComponent(
      JSON.stringify({
        id: "dev-user-001",
        email: "dev@flshbk.local",
        username: "dev_collector",
        display_name: "Dev Collector",
        avatar_url: null,
        bio: "Development mode — bypass auth",
        level: 7,
        xp: 3250,
        nexus_tokens: 2840,
        verified_trades: 14,
        is_verified: true,
        streak_count: 5,
        last_active: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    ),
    {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    }
  );

  return response;
}

export async function DELETE(request: NextRequest) {
  // Logout — clear dev cookies
  const response = NextResponse.json({ success: true });
  response.cookies.delete("dev_session");
  response.cookies.delete("dev_user");
  return response;
}
