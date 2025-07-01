# GitHub Secrets Setup Guide

## 📋 Step-by-Step GitHub Secrets Configuration

### 1. Access GitHub Secrets
1. Go to your GitHub repository: `https://github.com/Millsondylan/quantum-risk-coach`
2. Click **Settings** tab
3. Click **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 2. Add Required Secrets

Copy and paste these secrets one by one:

#### Supabase Configuration
```
Name: VITE_SUPABASE_URL
Value: https://heptsojfesbumrhwniqj.supabase.co
```

```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlcHRzb2pmZXNidW1yaHduaXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODQyNjUsImV4cCI6MjA2MzY2MDI2NX0.BFOaKS7RDeRAUFH1g1-OHV3a4jCe6LnNK5c3tEI8YeQ
```

#### AI Providers
```
Name: VITE_OPENAI_API_KEY
Value: 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
```

```
Name: VITE_GROQ_API_KEY
Value: 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
```

```
Name: VITE_GEMINI_API_KEY
Value: AIzaSyD3jSvbP_AntLSgc5vRJXMpVvPAJ0LBBb4
```

#### Market Data APIs
```
Name: VITE_YFINANCE_API_KEY
Value: C7wD6OmWJ_xzKSMZy0Vhpffs3hpyaYJU
```

```
Name: VITE_COINGECKO_API_KEY
Value: CG-nCXJTWBdFGw2TdzhBdPgi7uH
```

```
Name: VITE_ALPHA_VANTAGE_API_KEY
Value: DSPSF5OFTDBPT0Q3
```

```
Name: VITE_POLYGON_API_KEY
Value: iLvuzznF8yhGvWFxk_Dt7vr2ykM8p6BM
```

```
Name: VITE_EXCHANGERATE_API_KEY
Value: 82b2f90230ac56fe9e1ac7e1
```

```
Name: VITE_FIXER_API_KEY
Value: b86ef5114855abba3c2ad0d1776fdfe6
```

```
Name: VITE_FMP_API_KEY
Value: a8BaUPMXsbNfUmOeVMBVoaogf6oQzOQP
```

```
Name: VITE_ETHERSCAN_API_KEY
Value: 923QMUQKQ2IKXUTZGRFBCZ8IM84QZUD7Y6
```

```
Name: VITE_FINNHUB_API_KEY
Value: d1elql1r01qghj41ko20d1elql1r01qghj41ko2g
```

```
Name: VITE_NEWS_API_KEY
Value: d555ac49f0db4edeac533af9a7232345
```

#### Messaging/Bots
```
Name: VITE_TELEGRAM_BOT_TOKEN
Value: 7850305593:AAGWlAtH_N7UCsSZ5JecRseKz3-oSS7un84
```

```
Name: VITE_TELEGRAM_CHAT_ID
Value: [Your Telegram Chat ID - get from @userinfobot]
```

#### Additional Trading APIs (if you have them)
```
Name: VITE_TRADING_ECONOMICS_API_KEY
Value: [Your Trading Economics API key]
```

```
Name: VITE_FRED_API_KEY
Value: [Your FRED API key]
```

```
Name: VITE_BINANCE_API_KEY
Value: [Your Binance API key]
```

```
Name: VITE_BINANCE_SECRET_KEY
Value: [Your Binance Secret key]
```

```
Name: VITE_BYBIT_API_KEY
Value: [Your Bybit API key]
```

```
Name: VITE_BYBIT_SECRET_KEY
Value: [Your Bybit Secret key]
```

```
Name: VITE_KUCOIN_API_KEY
Value: [Your KuCoin API key]
```

```
Name: VITE_KUCOIN_SECRET_KEY
Value: [Your KuCoin Secret key]
```

### 3. Get Supabase Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click your profile picture (top right)
3. Select **Access Tokens**
4. Click **Generate new token**
5. Give it a name: "GitHub Actions"
6. Copy the token

```
Name: SUPABASE_ACCESS_TOKEN
Value: [Your Supabase access token]
```

### 4. Optional: Vercel Deployment Tokens

If you want to deploy to Vercel automatically:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Go to Settings → Tokens
3. Create a new token
4. Get your Org ID and Project ID from project settings

```
Name: VERCEL_TOKEN
Value: [Your Vercel token]
```

```
Name: VERCEL_ORG_ID
Value: [Your Vercel org ID]
```

```
Name: VERCEL_PROJECT_ID
Value: [Your Vercel project ID]
```

## 🚀 Quick Setup Script

Copy this to your .env file manually:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://heptsojfesbumrhwniqj.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhlcHRzb2pmZXNidW1yaHduaXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwODQyNjUsImV4cCI6MjA2MzY2MDI2NX0.BFOaKS7RDeRAUFH1g1-OHV3a4jCe6LnNK5c3tEI8YeQ

# AI Providers
VITE_OPENAI_API_KEY=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
VITE_GROQ_API_KEY=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
VITE_GEMINI_API_KEY=AIzaSyD3jSvbP_AntLSgc5vRJXMpVvPAJ0LBBb4

# Market Data APIs
VITE_YFINANCE_API_KEY=C7wD6OmWJ_xzKSMZy0Vhpffs3hpyaYJU
VITE_COINGECKO_API_KEY=CG-nCXJTWBdFGw2TdzhBdPgi7uH
VITE_ALPHA_VANTAGE_API_KEY=DSPSF5OFTDBPT0Q3
VITE_POLYGON_API_KEY=iLvuzznF8yhGvWFxk_Dt7vr2ykM8p6BM
VITE_EXCHANGERATE_API_KEY=82b2f90230ac56fe9e1ac7e1
VITE_FIXER_API_KEY=b86ef5114855abba3c2ad0d1776fdfe6
VITE_FMP_API_KEY=a8BaUPMXsbNfUmOeVMBVoaogf6oQzOQP
VITE_ETHERSCAN_API_KEY=923QMUQKQ2IKXUTZGRFBCZ8IM84QZUD7Y6
VITE_FINNHUB_API_KEY=d1elql1r01qghj41ko20d1elql1r01qghj41ko2g
VITE_NEWS_API_KEY=d555ac49f0db4edeac533af9a7232345

# Messaging/Bots
VITE_TELEGRAM_BOT_TOKEN=7850305593:AAGWlAtH_N7UCsSZ5JecRseKz3-oSS7un84
VITE_TELEGRAM_CHAT_ID=your_telegram_chat_id
```

## ✅ Verification

After adding all secrets:

1. Go to your repository **Actions** tab
2. Make a small commit to trigger the workflow
3. Watch the workflow run
4. Check if build and deployment succeed

## 🎯 What Happens Next

Once GitHub secrets are configured:

1. **Every commit** to main triggers deployment
2. **Automated testing** runs on pull requests  
3. **Database migrations** apply automatically
4. **Production deployment** happens seamlessly
5. **Environment variables** are securely injected

Your Quantum Risk Coach platform will be live and auto-updating! 🚀 