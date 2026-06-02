import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

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

  const response = NextResponse.redirect(new URL("/", request.url));

  // Simple dev session cookie
  response.cookies.set("dev_auth", "1", {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("dev_auth", "", {
    httpOnly: false,
    secure: false,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
