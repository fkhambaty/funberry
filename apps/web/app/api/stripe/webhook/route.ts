import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    { error: "Stripe is not used. FunBerry payment webhooks are verified by the Razorpay Worker." },
    { status: 410 },
  );
}
