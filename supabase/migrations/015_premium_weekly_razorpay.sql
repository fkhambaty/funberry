-- Weekly premium tier (Razorpay) + optional billing ids for support/debug

ALTER TABLE public.parents DROP CONSTRAINT IF EXISTS parents_subscription_tier_check;
ALTER TABLE public.parents ADD CONSTRAINT parents_subscription_tier_check
  CHECK (subscription_tier IN (
    'free',
    'premium_weekly',
    'premium_monthly',
    'premium_yearly',
    'lifetime'
  ));

ALTER TABLE public.parents
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_customer_id TEXT;

COMMENT ON COLUMN public.parents.razorpay_subscription_id IS 'Active Razorpay subscription id (sub_...), if any.';
COMMENT ON COLUMN public.parents.razorpay_customer_id IS 'Razorpay customer id (cust_...), if any.';
