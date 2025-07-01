import { supabase } from '@/integrations/supabase/client';

export interface DatabaseHealthCheck {
  connected: boolean;
  tablesExist: {
    trades: boolean;
    profiles: boolean;
    payments: boolean;
    marketplace_subscriptions: boolean;
  };
  tableDetails: Record<string, any>;
  errors: string[];
  warnings: string[];
}

export const checkDatabaseHealth = async (): Promise<DatabaseHealthCheck> => {
  const result: DatabaseHealthCheck = {
    connected: false,
    tablesExist: {
      trades: false,
      profiles: false,
      payments: false,
      marketplace_subscriptions: false,
    },
    tableDetails: {},
    errors: [],
    warnings: []
  };

  try {
    // Test basic connection with a simple query
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact' })
      .limit(1);

    if (connectionError) {
      result.errors.push(`Connection failed: ${connectionError.message}`);
      console.error('❌ Database connection failed:', connectionError);
      return result;
    }

    result.connected = true;
    console.log('✅ Database connection successful');

    // Check each table exists and get basic info
    const tables = ['trades', 'profiles', 'payments', 'marketplace_subscriptions'] as const;
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(1);
        
        if (!error) {
          result.tablesExist[table] = true;
          result.tableDetails[table] = {
            exists: true,
            rowCount: count || 0,
            hasData: (count || 0) > 0
          };
          console.log(`✅ Table '${table}' exists with ${count || 0} rows`);
        } else {
          result.errors.push(`Table ${table} error: ${error.message}`);
          result.tableDetails[table] = {
            exists: false,
            error: error.message
          };
          console.error(`❌ Table '${table}' error:`, error.message);
        }
      } catch (err) {
        result.errors.push(`Table ${table} check failed: ${err}`);
        result.tableDetails[table] = {
          exists: false,
          error: `${err}`
        };
        console.error(`❌ Table '${table}' check failed:`, err);
      }
    }

    // Note: RLS policy checks would require custom function
    // This is handled by the SQL generation instead

  } catch (error) {
    result.errors.push(`Database health check failed: ${error}`);
    console.error('❌ Database health check failed:', error);
  }

  return result;
};

export const setupTradingTables = async (): Promise<boolean> => {
  console.log('🔍 Checking database setup...');
  
  try {
    const health = await checkDatabaseHealth();
    
    if (!health.connected) {
      console.error('❌ Database connection failed');
      console.error('Errors:', health.errors);
      return false;
    }

    console.log('✅ Database connected successfully');
    
    const missingTables = Object.entries(health.tablesExist)
      .filter(([, exists]) => !exists)
      .map(([table]) => table);

    if (missingTables.length > 0) {
      console.warn('⚠️ Missing tables:', missingTables);
      console.log('📋 Please run the following SQL in your Supabase SQL Editor:');
      console.log(generateTableCreationSQL());
      return false;
    }

    console.log('✅ All required tables exist');
    
    // Log table statistics
    Object.entries(health.tableDetails).forEach(([table, details]) => {
      if (details.exists) {
        console.log(`📊 ${table}: ${details.rowCount} rows`);
      }
    });

    return true;
  } catch (error) {
    console.error('❌ Database setup check failed:', error);
    return false;
  }
};

// Generate SQL for creating missing tables
export const generateTableCreationSQL = (): string => {
  return `
-- Quantum Risk Coach Database Setup
-- Run this SQL in your Supabase SQL Editor

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
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for trades
CREATE POLICY "Users can view own trades" ON public.trades
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades" ON public.trades
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades" ON public.trades
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades" ON public.trades
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for marketplace_subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.marketplace_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON public.marketplace_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

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
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert initial profile for new users (trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;
};

// Test data creation for development
export const createTestTradeData = async (userId: string): Promise<boolean> => {
  const testTrades = [
    {
      user_id: userId,
      instrument: 'EURUSD',
      trade_type: 'buy',
      entry_price: 1.0850,
      exit_price: 1.0920,
      lot_size: 0.1,
      profit_loss: 70.00,
      status: 'closed',
      opened_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      closed_at: new Date(Date.now() - 82800000).toISOString(), // 1 hour later
      source: 'manual'
    },
    {
      user_id: userId,
      instrument: 'GBPUSD',
      trade_type: 'sell',
      entry_price: 1.2650,
      exit_price: 1.2580,
      lot_size: 0.2,
      profit_loss: 140.00,
      status: 'closed',
      opened_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      closed_at: new Date(Date.now() - 169200000).toISOString(), // 1 hour later
      source: 'manual'
    },
    {
      user_id: userId,
      instrument: 'USDJPY',
      trade_type: 'buy',
      entry_price: 150.25,
      lot_size: 0.1,
      status: 'open',
      opened_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      source: 'manual'
    }
  ];

  try {
    const { data, error } = await supabase
      .from('trades')
      .insert(testTrades)
      .select();

    if (error) {
      console.error('Failed to create test trades:', error);
      return false;
    }

    console.log('✅ Test trade data created:', data);
    return true;
  } catch (error) {
    console.error('Error creating test data:', error);
    return false;
  }
}; 