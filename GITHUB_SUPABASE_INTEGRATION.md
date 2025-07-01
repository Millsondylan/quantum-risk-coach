# GitHub + Supabase Integration Guide

## 🎯 Overview

Your Quantum Risk Coach application is now configured for seamless integration between GitHub and Supabase with automated deployments. This setup provides:

- **Automated deployments** on every commit to main
- **Database migrations** through Supabase CLI
- **Environment variable management** through GitHub Secrets
- **Continuous integration** with testing and type checking
- **Production-ready** builds with security headers

## 🔧 Current Configuration

### Supabase Project
- **Project ID**: `heptsojfesbumrhwniqj`
- **Project URL**: `https://heptsojfesbumrhwniqj.supabase.co`
- **Status**: ✅ Connected and configured

### GitHub Repository
- **Repository**: Your quantum-risk-coach repo
- **Branch**: main (protected)
- **Actions**: ✅ Configured for CI/CD

## 🚀 Setup Steps

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, then add these secrets:

#### Required Secrets
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://heptsojfesbumrhwniqj.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
SUPABASE_DB_PASSWORD=your_database_password

# API Keys (from your .env)
VITE_OPENAI_API_KEY=your_openai_key
VITE_GROQ_API_KEY=your_groq_key
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
VITE_NEWS_API_KEY=your_news_api_key
VITE_TRADING_ECONOMICS_API_KEY=your_trading_economics_key
VITE_BINANCE_API_KEY=your_binance_key
VITE_BINANCE_SECRET_KEY=your_binance_secret
VITE_TELEGRAM_BOT_TOKEN=your_telegram_token
VITE_TELEGRAM_CHAT_ID=your_telegram_chat_id

# Deployment (Optional - for Vercel)
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### 2. Get Supabase Access Token

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your profile (top right)
3. Go to "Access Tokens"
4. Generate a new token
5. Copy and add to GitHub Secrets as `SUPABASE_ACCESS_TOKEN`

### 3. Enable GitHub Actions

The workflow file is already created at `.github/workflows/deploy.yml`. It will automatically:

1. **Test** your code on every push/PR
2. **Build** the application with all environment variables
3. **Deploy** to production when pushing to main
4. **Migrate** database changes through Supabase CLI

### 4. Set Up Supabase CLI (Optional - for local development)

```bash
# Install Supabase CLI
npm install -g @supabase/cli

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref heptsojfesbumrhwniqj

# Pull latest schema
supabase db pull
```

## 📦 Deployment Options

### Option 1: Vercel (Recommended)

1. **Connect Vercel to GitHub:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect Vite configuration

2. **Configure Environment Variables in Vercel:**
   - Add all your VITE_ environment variables
   - Vercel will automatically deploy on every push to main

3. **Get Vercel Tokens (for GitHub Actions):**
   - Go to Vercel Dashboard → Settings → Tokens
   - Create a new token
   - Add to GitHub Secrets

### Option 2: Netlify

1. **Connect to GitHub:**
   - Go to [netlify.com](https://netlify.com)
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Configure Environment Variables:**
   - Add all VITE_ variables in Netlify dashboard

### Option 3: Manual Deployment

```bash
# Build locally
npm run build

# Upload dist folder to your hosting provider
```

## 🔄 Automated Workflows

### On Every Push/PR:
1. Checkout code
2. Install dependencies
3. Run linting (with warnings)
4. Run TypeScript type checking
5. Build application
6. Upload build artifacts

### On Push to Main:
1. All above steps
2. Deploy to production (Vercel/Netlify)
3. Run database migrations
4. Send deployment notifications

## 🛡️ Security Features

### Environment Protection
- All API keys stored as GitHub Secrets
- No sensitive data in repository
- Encrypted secret storage

### Build Security
- Type checking on every build
- Security headers in production
- Content Security Policy
- XSS protection

### Database Security
- Row Level Security (RLS) enabled
- Authenticated access only
- Migration approval process

## 📊 Database Management

### Schema Changes
1. Make changes locally
2. Test with `npm run dev`
3. Commit to GitHub
4. Automatic migration on deployment

### Manual Migration
```bash
# Generate migration
supabase db diff --use-migra -f new_migration

# Apply migration
supabase db push
```

## 🔍 Monitoring

### GitHub Actions
- View build logs in Actions tab
- Monitor deployment status
- Review test results

### Supabase Dashboard
- Monitor database performance
- View real-time analytics
- Check authentication logs

### Production Monitoring
- Application performance
- API usage metrics
- User analytics

## 🚨 Troubleshooting

### Build Failures
1. Check GitHub Actions logs
2. Verify environment variables
3. Test build locally: `npm run build`

### Database Issues
1. Check Supabase dashboard
2. Verify migrations applied
3. Test connection: `supabase db ping`

### Deployment Issues
1. Check Vercel/Netlify logs
2. Verify environment variables
3. Test locally: `npm run preview`

## ✅ Success Checklist

- [ ] GitHub Secrets configured
- [ ] Supabase access token added
- [ ] GitHub Actions enabled
- [ ] First deployment successful
- [ ] Database migrations working
- [ ] Environment variables set
- [ ] Production URL accessible
- [ ] All features working live

## 🎉 You're Live!

Once configured, your Quantum Risk Coach application will:

1. **Auto-deploy** on every commit to main
2. **Maintain database** with automated migrations
3. **Scale automatically** with serverless hosting
4. **Monitor performance** through integrated dashboards
5. **Secure user data** with enterprise-grade security

Your professional trading platform is now production-ready with enterprise-level CI/CD! 🚀 