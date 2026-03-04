-- 1. Create is_admin column in profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Update appointments RLS policies to allow admins to see and delete all
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Users can delete their own appointments" ON public.appointments;

-- Admins can view ALL appointments, regular users can view their own
CREATE POLICY "Users can view appointments" ON public.appointments
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Admins can insert appointments for anyone, regular users can insert for themselves
CREATE POLICY "Users can create appointments" ON public.appointments
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Admins can delete ALL appointments, regular users can delete their own
CREATE POLICY "Users can delete appointments" ON public.appointments
  FOR DELETE USING (
    auth.uid() = user_id OR 
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );

-- Admins can update ALL appointments
CREATE POLICY "Admins can update appointments" ON public.appointments
  FOR UPDATE USING (
    (SELECT is_admin FROM public.profiles WHERE id = auth.uid()) = true
  );
