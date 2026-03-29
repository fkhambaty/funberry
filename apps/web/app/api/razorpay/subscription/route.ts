import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

/** Razorpay Node typings lag the REST API; use a narrow facade for subscription + customer calls. */
type RazorpaySdk = {
  customers: {
    create: (opts: Record<string, unknown>) => Promise<{ id: string }>;
    all: (opts: Record<string, unknown>) => Promise<{ items?: { id: string }[] }>;
  };
  subscriptions: {
    create: (opts: Record<string, unknown>) => Promise<{ id: string }>;
  };
};

const TIER_BY_PLAN = {
  weekly: "premium_weekly",
  monthly: "premium_monthly",
} as const;

type PlanKey = keyof typeof TIER_BY_PLAN;

function getRazorpay(): RazorpaySdk | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return instance as unknown as RazorpaySdk;
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * POST /api/razorpay/subscription
 * Body: { plan: "weekly" | "monthly" }
 * Header: Authorization: Bearer <Supabase access_token>
 *
 * Creates a Razorpay subscription and returns ids for Checkout (subscription mode).
 * Requires env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_PLAN_WEEKLY_ID, RAZORPAY_PLAN_MONTHLY_ID,
 * NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 *
 * Create matching plans in Razorpay Dashboard (Subscriptions → Plans): ₹99/week, ₹349/month, INR.
 */
export async function POST(request: Request) {
  try {
    const razorpay = getRazorpay();
    const admin = getSupabaseAdmin();
    if (!razorpay || !admin) {
      return NextResponse.json(
        { error: "Payments not configured (Razorpay or Supabase service role)." },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();
    if (!token) {
      return NextResponse.json({ error: "Missing Authorization bearer token." }, { status: 401 });
    }

    const {
      data: { user },
      error: authErr,
    } = await admin.auth.getUser(token);
    if (authErr || !user?.id || !user.email) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const body = (await request.json()) as { plan?: string };
    const plan = body.plan as PlanKey;
    if (plan !== "weekly" && plan !== "monthly") {
      return NextResponse.json({ error: 'Invalid plan. Use "weekly" or "monthly".' }, { status: 400 });
    }

    const planId =
      plan === "weekly"
        ? process.env.RAZORPAY_PLAN_WEEKLY_ID
        : process.env.RAZORPAY_PLAN_MONTHLY_ID;
    if (!planId?.startsWith("plan_")) {
      return NextResponse.json(
        {
          error:
            "Missing Razorpay plan id. Set RAZORPAY_PLAN_WEEKLY_ID and RAZORPAY_PLAN_MONTHLY_ID to plan_… from the Razorpay dashboard.",
        },
        { status: 503 }
      );
    }

    const tier = TIER_BY_PLAN[plan];
    const name =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email.split("@")[0] ||
      "Parent";

    let customerId: string | undefined;
    const { data: parentRow } = await admin
      .from("parents")
      .select("razorpay_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    const existingCust = (parentRow as { razorpay_customer_id?: string | null } | null)?.razorpay_customer_id;
    if (existingCust?.startsWith("cust_")) {
      customerId = existingCust;
    } else {
      try {
        const cust = await razorpay.customers.create({
          name,
          email: user.email,
          fail_existing: 0,
          notes: { supabase_user_id: user.id },
        });
        customerId = cust.id;
      } catch {
        const list = await razorpay.customers.all({ email: user.email });
        const first = list.items?.[0];
        if (!first?.id) throw new Error("Could not create or find Razorpay customer for this email.");
        customerId = first.id;
      }
      await admin
        .from("parents")
        .update({ razorpay_customer_id: customerId, updated_at: new Date().toISOString() } as never)
        .eq("id", user.id);
    }

    const subscription = (await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      quantity: 1,
      total_count: 520,
      customer_id: customerId,
      notes: {
        supabase_user_id: user.id,
        tier,
        app: "funberrykids",
      },
    })) as { id: string };

    return NextResponse.json({
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
      tier,
      planLabel: plan === "weekly" ? "FunBerryKids — Weekly" : "FunBerryKids — Monthly",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to create subscription";
    console.error("[razorpay/subscription]", e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
