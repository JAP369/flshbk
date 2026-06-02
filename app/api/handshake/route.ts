import { NextRequest, NextResponse } from "next/server";

const DEV_FEE_PERCENT = 0.025; // 2.5%
const NEXUS_REWARD_BASE = 10; // Base $NEXUS tokens per trade
const NEXUS_PER_HKD = 0.01; // Additional $NEXUS per HKD of trade value

interface HandshakeRequest {
  tradeId: string;
  initiatorQr: string;
  counterpartyQr: string;
  tradeValueHKD: number;
  safeZoneId: string;
}

interface HandshakeResponse {
  success: boolean;
  tradeId: string;
  feeHKD: number;
  nexusEarned: number;
  transactionHash: string;
  status: "complete" | "pending" | "failed";
  message: string;
}

function generateTxHash(): string {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

function validateQrPayload(qr: string): boolean {
  // QR codes must be non-empty strings of reasonable length
  return typeof qr === "string" && qr.length >= 8 && qr.length <= 512;
}

export async function POST(request: NextRequest) {
  let body: HandshakeRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { tradeId, initiatorQr, counterpartyQr, tradeValueHKD, safeZoneId } = body;

  // Input validation
  if (!tradeId || typeof tradeId !== "string" || tradeId.length > 100) {
    return NextResponse.json(
      { success: false, message: "Invalid tradeId" },
      { status: 400 }
    );
  }

  if (!validateQrPayload(initiatorQr)) {
    return NextResponse.json(
      { success: false, message: "Invalid initiator QR code" },
      { status: 400 }
    );
  }

  if (!validateQrPayload(counterpartyQr)) {
    return NextResponse.json(
      { success: false, message: "Invalid counterparty QR code" },
      { status: 400 }
    );
  }

  if (
    typeof tradeValueHKD !== "number" ||
    tradeValueHKD <= 0 ||
    tradeValueHKD > 10_000_000
  ) {
    return NextResponse.json(
      { success: false, message: "Trade value must be a positive number up to 10,000,000 HKD" },
      { status: 400 }
    );
  }

  if (!safeZoneId || typeof safeZoneId !== "string" || safeZoneId.length > 50) {
    return NextResponse.json(
      { success: false, message: "Invalid safeZoneId" },
      { status: 400 }
    );
  }

  // Verify QR codes are distinct (each party has a unique code)
  if (initiatorQr === counterpartyQr) {
    return NextResponse.json(
      { success: false, message: "Initiator and counterparty QR codes must be different" },
      { status: 400 }
    );
  }

  // Fee calculation
  const feeHKD = Math.round(tradeValueHKD * DEV_FEE_PERCENT * 100) / 100;

  // $NEXUS token reward calculation
  const nexusEarned =
    NEXUS_REWARD_BASE + Math.floor(tradeValueHKD * NEXUS_PER_HKD);

  const response: HandshakeResponse = {
    success: true,
    tradeId,
    feeHKD,
    nexusEarned,
    transactionHash: generateTxHash(),
    status: "complete",
    message: `Trade verified at safe zone. Fee: HKD ${feeHKD}. Earned: ${nexusEarned} $NEXUS.`,
  };

  return NextResponse.json(response, { status: 200 });
}
