# Database and Authentication Setup Guide

## 🚀 Quick Setup Verification

Run this command to check your setup status:

```bash
node setup-check.js
```

This will verify your environment configuration and guide you through any missing steps.

## 📋 Complete Setup Process

### 1. Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp env.example .env
   ```

2. **Configure Supabase credentials:**
   - Open `.env` in your editor
   - Replace `your_supabase_url_here` with your actual Supabase project URL
   - Replace `your_supabase_anon_key_here` with your actual Supabase anon key

3. **Get your Supabase credentials:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project or select existing one
   - Go to Settings → API
   - Copy the Project URL and anon public key

### 2. Database Setup

The application requires several tables in your Supabase database. Here's how to set them up:

#### Option A: Automated Setup (Recommended)

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12 → Console tab)

3. **Run the setup verification:**
   ```javascript
   window.verifySetup()
   ```

4. **If tables are missing, the console will show a complete SQL script**

#### Option B: Manual Setup

1. **Go to your Supabase project dashboard**
2. **Open SQL Editor**
3. **Copy and paste the following SQL script:**

```sql
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
```

4. **Click "Run" to execute the script**

### 3. Authentication Setup

1. **Enable Email Authentication:**
   - Go to Authentication → Settings in your Supabase dashboard
   - Enable "Email" provider
   - Configure email templates (optional)

2. **Configure Email Confirmation (Optional):**
   - Set "Enable email confirmations" if you want users to verify their email
   - Configure custom SMTP settings if needed

### 4. Verification

After completing the setup, verify everything is working:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the browser console (F12)**

3. **Run comprehensive verification:**
   ```javascript
   window.verifySetup()
   ```

4. **Quick health check:**
   ```javascript
   window.quickHealthCheck()
   ```

## 🛠️ Debugging Commands

The application provides several debugging commands in the browser console:

```javascript
// Complete setup verification
window.verifySetup()

// Quick connection check
window.quickConnectionTest()

// Validate environment variables
window.validateEnvironment()

// Test specific login
window.testSpecificLogin('test@example.com', 'password')

// Test specific signup
window.testSpecificSignup('test@example.com', 'password', 'username')
```

## 📊 Database Schema

### Tables Created:

1. **profiles** - User profile information
2. **trades** - Trading history and open positions
3. **payments** - Payment tracking
4. **marketplace_subscriptions** - Subscription management

### Security:

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Automatic profile creation on user signup
- Proper foreign key relationships

## ⚠️ Common Issues

### Issue: "Connection failed"
**Solution:** Check your Supabase URL and anon key in `.env`

### Issue: "Missing tables"
**Solution:** Run the SQL setup script in Supabase SQL Editor

### Issue: "Authentication issues"
**Solution:** Enable email authentication in Supabase settings

### Issue: "Environment variables not loaded"
**Solution:** Restart your development server after editing `.env`

## 🚀 Next Steps

After successful setup:

1. **Test user registration** by going to `/auth` and creating an account
2. **Test login** with your new account
3. **Explore the application** features
4. **Check the trading journal** functionality
5. **Configure additional API keys** for market data (optional)

## 📝 Notes

- The application automatically creates user profiles on signup
- All user data is protected by Row Level Security
- The setup process includes comprehensive error checking
- You can run setup verification at any time to check the status

For additional help, check the console output during initialization for detailed status information. 