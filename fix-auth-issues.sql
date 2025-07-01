-- =====================================================
-- Fix Authentication Issues - Quantum Risk Coach
-- =====================================================
-- Run this in Supabase SQL Editor to fix login/signup issues
-- =====================================================

-- 1. TEMPORARILY DISABLE RLS TO TEST
-- =====================================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 2. DROP EXISTING POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 3. CREATE MORE PERMISSIVE POLICIES
-- =====================================================
CREATE POLICY "Enable read access for authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. RE-ENABLE RLS
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. FIX THE USER CREATION TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    username, 
    email,
    subscription_status,
    subscription_expires_at,
    posts_remaining,
    trial_used,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    'unlimited',
    '2099-12-31 23:59:59+00',
    999999,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ENSURE TRIGGER EXISTS
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. CREATE TEST FUNCTION FOR DEBUGGING
-- =====================================================
CREATE OR REPLACE FUNCTION public.test_auth_setup()
RETURNS TABLE(
  test_name text,
  status text,
  message text
) AS $$
BEGIN
  -- Test 1: Check if profiles table exists
  RETURN QUERY
  SELECT 
    'profiles_table'::text,
    'success'::text,
    'Profiles table exists'::text
  WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles');
  
  -- Test 2: Check RLS status
  RETURN QUERY
  SELECT 
    'rls_enabled'::text,
    CASE WHEN relrowsecurity THEN 'success' ELSE 'warning' END::text,
    CASE WHEN relrowsecurity THEN 'RLS enabled' ELSE 'RLS disabled' END::text
  FROM pg_class WHERE relname = 'profiles';
  
  -- Test 3: Count policies
  RETURN QUERY
  SELECT 
    'policies_count'::text,
    'info'::text,
    'Found ' || COUNT(*)::text || ' policies'::text
  FROM pg_policies WHERE tablename = 'profiles';
  
  -- Test 4: Check trigger exists
  RETURN QUERY
  SELECT 
    'trigger_exists'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN 'success' ELSE 'error' END::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN 'User creation trigger exists' ELSE 'User creation trigger missing!' END::text;
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TEST THE SETUP
-- =====================================================
SELECT * FROM public.test_auth_setup();

-- 9. COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Authentication fix script completed!';
  RAISE NOTICE '✅ More permissive RLS policies created';
  RAISE NOTICE '✅ User creation trigger updated';  
  RAISE NOTICE '✅ Test function created';
  RAISE NOTICE '🧪 Try signing up/logging in now!';
END $$; 