import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { error: "Stripe is not used. FunBerry checkout is handled by the verified Razorpay flow." },
    { status: 410 },
  );
}
