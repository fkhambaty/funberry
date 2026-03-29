-- When email confirmation is ON, signUp returns no session — client-side INSERT into
-- parents fails RLS. Create parent row from auth.users + signup metadata instead.

CREATE OR REPLACE FUNCTION public.handle_new_parent_from_auth()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.parents (id, email, name, pin)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
      ''
    ),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'pin'), '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = CASE
      WHEN EXCLUDED.name <> '' THEN EXCLUDED.name
      ELSE public.parents.name
    END,
    pin = COALESCE(NULLIF(EXCLUDED.pin, ''), public.parents.pin),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_parent ON auth.users;
CREATE TRIGGER on_auth_user_created_parent
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_parent_from_auth();
