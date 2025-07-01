# 🚀 GitHub Setup Guide for Quantum Risk Coach

# 🔐 GitHub Repository Secrets Setup

To fix the GitHub Actions workflow validation errors, you need to configure repository secrets.

## 📋 Required Secrets

### 1. Essential Secrets (Required)
Add these in GitHub: **Settings > Secrets and variables > Actions**

```
VITE_SUPABASE_URL=https://heptsojfesbumrhwniqj.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Optional API Keys (For full features)
```
VITE_OPENAI_API_KEY=your_openai_key
VITE_GROQ_API_KEY=your_groq_key
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_NEWS_API_KEY=your_news_api_key
VITE_TRADING_ECONOMICS_API_KEY=your_trading_economics_key
VITE_BINANCE_API_KEY=your_binance_key
VITE_BINANCE_SECRET_KEY=your_binance_secret
VITE_TELEGRAM_BOT_TOKEN=your_telegram_bot_token
VITE_TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### 3. Deployment Secrets (Optional)
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_DB_PASSWORD=your_supabase_db_password
```

## 🎯 Quick Setup Steps

1. **Go to GitHub repository**: https://github.com/yourusername/quantum-risk-coach
2. **Navigate to**: Settings > Secrets and variables > Actions
3. **Click "New repository secret"**
4. **Add each secret one by one**

## 🔍 Find Your Values

- **Supabase URL**: https://heptsojfesbumrhwniqj.supabase.co (already known)
- **Supabase Anon Key**: Check your `.env` file
- **Other API keys**: Check your `.env` file or provider dashboards

## ✅ Verification

After adding secrets:
- The workflow validation errors will disappear
- GitHub Actions will run successfully on push/PR
- Deployment will work automatically
