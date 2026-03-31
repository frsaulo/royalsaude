-- 1. Add account type and dependents columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'TITULAR',
  ADD COLUMN IF NOT EXISTS dependents JSONB DEFAULT '[]'::jsonb;

-- 2. Backfill existing users
UPDATE public.profiles
SET
  account_type = COALESCE(account_type, 'TITULAR'),
  dependents = COALESCE(dependents, '[]'::jsonb);

-- 3. Update signup trigger to persist account type and dependents
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, cpf, phone, email, account_type, dependents)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'phone',
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'TITULAR'),
    COALESCE(NEW.raw_user_meta_data->'dependents', '[]'::jsonb)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
