-- Track one-time welcome email after authentication (sent via Edge Function + Resend).

ALTER TABLE public.parents
  ADD COLUMN IF NOT EXISTS welcome_email_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN public.parents.welcome_email_sent_at IS
  'Set when the post-auth welcome email was sent (Edge Function send-welcome-email).';
