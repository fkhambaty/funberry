import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(signature, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function notesTier(entity: Record<string, unknown>): string | null {
  const notes = asRecord(entity.notes);
  const tier = notes?.tier;
  return typeof tier === "string" ? tier : null;
}

function userIdFromNotes(entity: Record<string, unknown>): string | null {
  const notes = asRecord(entity.notes);
  const id = notes?.supabase_user_id;
  return typeof id === "string" && id.length > 10 ? id : null;
}

function currentEndIso(entity: Record<string, unknown>): string | null {
  const end = entity.current_end;
  if (typeof end === "number" && Number.isFinite(end)) {
    return new Date(end * 1000).toISOString();
  }
  return null;
}

/**
 * POST /api/razorpay/webhook
 * Configure in Razorpay Dashboard → Webhooks (same secret as RAZORPAY_WEBHOOK_SECRET).
 * Subscribe to: subscription.activated, subscription.charged, subscription.cancelled,
 * subscription.halted, subscription.completed, subscription.paused (optional).
 */
export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const admin = getSupabaseAdmin();
  if (!secret || !admin) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let parsed: { event?: string; payload?: Record<string, { entity?: unknown }> };
  try {
    parsed = JSON.parse(rawBody) as typeof parsed;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = parsed.event ?? "";
  const subPayload = parsed.payload?.subscription?.entity;
  const entity = asRecord(subPayload);
  if (!entity && event.startsWith("subscription.")) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const userId = entity ? userIdFromNotes(entity) : null;
  const tierNote = entity ? notesTier(entity) : null;
  const subId = typeof entity?.id === "string" ? entity.id : null;
  const custId = typeof entity?.customer_id === "string" ? entity.customer_id : null;

  if (!userId && event.startsWith("subscription.")) {
    console.warn("[razorpay/webhook] missing supabase_user_id in subscription notes", event);
    return NextResponse.json({ received: true, warning: "no_user_in_notes" });
  }

  const expiresAt = entity ? currentEndIso(entity) : null;

  try {
    if (event === "subscription.activated" || event === "subscription.charged") {
      const tier =
        tierNote === "premium_weekly" || tierNote === "premium_monthly" ? tierNote : "premium_monthly";

      await admin
        .from("parents")
        .update(
          {
            subscription_tier: tier,
            subscription_expires_at: expiresAt,
            razorpay_subscription_id: subId,
            ...(custId ? { razorpay_customer_id: custId } : {}),
            updated_at: new Date().toISOString(),
          } as never
        )
        .eq("id", userId!);
    } else if (
      event === "subscription.cancelled" ||
      event === "subscription.completed" ||
      event === "subscription.halted" ||
      event === "subscription.paused"
    ) {
      await admin
        .from("parents")
        .update({
          subscription_tier: "free",
          subscription_expires_at: null,
          razorpay_subscription_id: null,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", userId!);
    }
  } catch (e) {
    console.error("[razorpay/webhook] update failed", e);
    return NextResponse.json({ error: "update_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
