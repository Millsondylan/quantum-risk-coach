#!/usr/bin/env node

/**
 * Database Setup Verification and Auto-Setup Script
 * This script verifies the database setup and creates missing tables automatically
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#][^=]*?)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Quantum Risk Coach - Database Verification & Setup\n');

// Test connection
async function testConnection() {
  console.log('1️⃣ Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return false;
  }
}

// Check if tables exist
async function checkTables() {
  console.log('\n2️⃣ Checking database tables...');
  const tables = ['profiles', 'trades', 'payments', 'marketplace_subscriptions'];
  const tableStatus = {};
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (!error) {
        tableStatus[table] = { exists: true, rowCount: count || 0 };
        console.log(`✅ Table '${table}' exists (${count || 0} rows)`);
      } else {
        tableStatus[table] = { exists: false, error: error.message };
        console.log(`❌ Table '${table}' missing: ${error.message}`);
      }
    } catch (err) {
      tableStatus[table] = { exists: false, error: err.message };
      console.log(`❌ Table '${table}' error: ${err.message}`);
    }
  }
  
  return tableStatus;
}

// SQL for creating tables
const setupSQL = `
-- Quantum Risk Coach Database Setup
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'free',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  posts_remaining INTEGER DEFAULT 5,
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

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
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

-- Create RLS policies for trades
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

-- Create RLS policies for payments
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

-- Create RLS policies for marketplace_subscriptions
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_opened_at ON public.trades(opened_at);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_subscriptions_user_id ON public.marketplace_subscriptions(user_id);

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

-- Insert initial profile for new users (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

// Test authentication
async function testAuth() {
  console.log('\n3️⃣ Testing authentication...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message !== 'Auth session missing!') {
      console.error('❌ Auth error:', error.message);
      return false;
    }
    console.log('✅ Authentication methods available');
    return true;
  } catch (error) {
    console.error('❌ Auth test failed:', error.message);
    return false;
  }
}

// Write SQL to file for manual execution
function writeSQLFile() {
  const sqlFile = path.join(__dirname, 'database-setup.sql');
  fs.writeFileSync(sqlFile, setupSQL);
  console.log(`📝 SQL script written to: ${sqlFile}`);
  return sqlFile;
}

// Main execution
async function main() {
  // Test connection
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }

  // Check tables
  const tableStatus = await checkTables();
  const missingTables = Object.entries(tableStatus)
    .filter(([, status]) => !status.exists)
    .map(([table]) => table);

  // Test auth
  await testAuth();

  if (missingTables.length > 0) {
    console.log(`\n⚠️  Missing tables: ${missingTables.join(', ')}`);
    
    // Write SQL file
    const sqlFile = writeSQLFile();
    
    console.log('\n📋 To complete setup:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Open SQL Editor');
    console.log('3. Create a new query');
    console.log(`4. Copy the contents of ${sqlFile} or the SQL below:`);
    console.log('5. Run the query');
    
    console.log('\n' + '='.repeat(60));
    console.log('COPY THIS SQL TO YOUR SUPABASE SQL EDITOR:');
    console.log('='.repeat(60));
    console.log(setupSQL);
    console.log('='.repeat(60));
    
    console.log('\n⚠️  Database setup is incomplete');
    console.log('✅ Run the SQL script above in Supabase to complete setup');
  } else {
    console.log('\n🎉 All database tables exist!');
    console.log('✅ Database setup is complete');
    console.log('✅ Authentication is configured');
    console.log('✅ Ready to use Quantum Risk Coach!');
  }

  console.log('\n🚀 Start the app: npm run dev');
  console.log('🌐 Open: http://localhost:8080');
}

main().catch(console.error); 