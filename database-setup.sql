-- =====================================================
-- Quantum Risk Coach - Complete Database Setup Script
-- =====================================================
-- Instructions:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Create a new query
-- 4. Copy and paste this entire script
-- 5. Click "Run" to execute
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'unlimited',
  subscription_expires_at TIMESTAMP WITH TIME ZONE DEFAULT '2099-12-31 23:59:59+00',
  posts_remaining INTEGER DEFAULT 999999,
  total_likes_received INTEGER DEFAULT 0,
  trial_used BOOLEAN DEFAULT FALSE
);

-- Create trades table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  instrument TEXT NOT NULL,
  trade_type TEXT CHECK (trade_type IN ('buy', 'sell')),
  entry_price DECIMAL(10, 5),
  exit_price DECIMAL(10, 5),
  lot_size DECIMAL(10, 2),
  profit_loss DECIMAL(10, 2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  stop_loss DECIMAL(10, 5),
  take_profit DECIMAL(10, 5),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT DEFAULT 'manual',
  mt5_ticket_id TEXT
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  plan_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  crypto_address TEXT,
  payment_proof_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create marketplace_subscriptions table
CREATE TABLE IF NOT EXISTS public.marketplace_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  tradingview_username TEXT,
  payment_proof_url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_subscriptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR PROFILES
-- =====================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- =====================================================
-- RLS POLICIES FOR TRADES
-- =====================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trades' AND policyname = 'Users can view own trades'
  ) THEN
    CREATE POLICY "Users can view own trades" ON public.trades
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trades' AND policyname = 'Users can insert own trades'
  ) THEN
    CREATE POLICY "Users can insert own trades" ON public.trades
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trades' AND policyname = 'Users can update own trades'
  ) THEN
    CREATE POLICY "Users can update own trades" ON public.trades
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'trades' AND policyname = 'Users can delete own trades'
  ) THEN
    CREATE POLICY "Users can delete own trades" ON public.trades
      FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- RLS POLICIES FOR PAYMENTS
-- =====================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' AND policyname = 'Users can view own payments'
  ) THEN
    CREATE POLICY "Users can view own payments" ON public.payments
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' AND policyname = 'Users can insert own payments'
  ) THEN
    CREATE POLICY "Users can insert own payments" ON public.payments
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- RLS POLICIES FOR MARKETPLACE SUBSCRIPTIONS
-- =====================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'marketplace_subscriptions' AND policyname = 'Users can view own subscriptions'
  ) THEN
    CREATE POLICY "Users can view own subscriptions" ON public.marketplace_subscriptions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'marketplace_subscriptions' AND policyname = 'Users can insert own subscriptions'
  ) THEN
    CREATE POLICY "Users can insert own subscriptions" ON public.marketplace_subscriptions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_opened_at ON public.trades(opened_at);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_subscriptions_user_id ON public.marketplace_subscriptions(user_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation
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
    trial_used
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'New User'),
    NEW.email,
    'unlimited',
    '2099-12-31 23:59:59+00',
    999999,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- GRANT UNLIMITED ACCESS TO ALL USERS
-- =====================================================

-- Function to grant unlimited access to all users
CREATE OR REPLACE FUNCTION public.grant_unlimited_access_to_all()
RETURNS TEXT AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update all existing profiles to have unlimited access
  UPDATE public.profiles 
  SET 
    subscription_status = 'unlimited',
    subscription_expires_at = '2099-12-31 23:59:59+00',
    posts_remaining = 999999,
    trial_used = false,
    updated_at = NOW()
  WHERE subscription_status != 'unlimited';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN format('✅ Granted unlimited access to %s users', updated_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function to update existing users
SELECT public.grant_unlimited_access_to_all();

-- =====================================================

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '🎉 Quantum Risk Coach Database Setup Complete!';
  RAISE NOTICE '💎 ALL USERS NOW HAVE UNLIMITED ACCESS FOREVER!';
  RAISE NOTICE '📊 Database tables created and configured';
  RAISE NOTICE '🔒 Row Level Security policies enabled';
  RAISE NOTICE '⚡ Performance indexes created';
  RAISE NOTICE '🤖 Automatic triggers configured';
  RAISE NOTICE '👥 User profiles will be created automatically';
  RAISE NOTICE '🎉 Ready to use Quantum Risk Coach!';
END $$; 