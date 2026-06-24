import { NextResponse, type NextRequest } from "next/server";
import { seedUserPortfolio, SEED_ASSETS } from "@/lib/portfolio/seed-portfolio";

export async function POST(request: NextRequest) {
  try {
    // Optional: Allow passing a specific userId in the body
    const body = await request.json().catch(() => ({}));
    const userId = body?.userId || undefined;

    const result = await seedUserPortfolio(userId);

    return NextResponse.json({
      success: result.totalFailed === 0,
      message: `Seeded ${result.totalSuccess}/${result.totalAttempted} assets`,
      ...result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Seeding failed",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Portfolio Seed Endpoint",
    usage: "POST /api/portfolio/seed with optional { userId } in body",
    assets: SEED_ASSETS,
  });
}
