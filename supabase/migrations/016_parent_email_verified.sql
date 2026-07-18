-- Track whether a parent has verified their email via the 6-digit signup code.
-- Source of truth is auth.users.email_confirmed_at; we mirror it into parents.email_verified
-- so it can be queried directly from the public schema.

ALTER TABLE public.parents
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;

-- On signup the parent row is inserted (unverified). Seed email_verified from the
-- auth row so an already-confirmed user (e.g. auto-confirm) starts verified.
CREATE OR REPLACE FUNCTION public.handle_new_parent_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.parents (id, email, name, pin, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      ''
    ),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'pin'), ''),
    (NEW.email_confirmed_at IS NOT NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = CASE
      WHEN EXCLUDED.name <> '' THEN EXCLUDED.name
      ELSE public.parents.name
    END,
    pin = COALESCE(NULLIF(EXCLUDED.pin, ''), public.parents.pin),
    email_verified = public.parents.email_verified OR EXCLUDED.email_verified,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Flip email_verified to true the moment the user confirms their email (code accepted).
CREATE OR REPLACE FUNCTION public.sync_parent_email_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.parents
      SET email_verified = true, updated_at = now()
      WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_confirmed_parent ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_parent
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.sync_parent_email_verified();

-- Backfill existing rows from current auth state.
UPDATE public.parents p
  SET email_verified = true
  FROM auth.users u
  WHERE u.id = p.id AND u.email_confirmed_at IS NOT NULL AND p.email_verified = false;
