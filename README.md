# 🚀 Qlarity - Next-Gen Trading Intelligence Platform

A comprehensive AI-powered trading platform that combines advanced analytics, real-time coaching, and personalized risk management to elevate your trading performance.

## ✨ Core Features

### 🎯 Core Integrations
- **Multi-Platform Broker Integration**: One-click import from MetaTrader 4/5, Binance, Bybit, cTrader, KuCoin, OKX, MEXC
- **Periodic Auto-Sync**: Configurable intervals with error-free import and reconciliation
- **Custom Trade Builder**: Create and save personalized trade setups with advanced risk management
- **Real-time Data Processing**: Live market data integration with instant analysis

### 📊 Performance & Analytics
- **Advanced Analytics Dashboard**: Risk-reward ratio, profit factor, win rate, daily/historical PnL charts
- **Time-based Metrics**: Hourly, daily, monthly performance analysis with position comparisons
- **Symbol-specific Performance**: Detailed analysis by trading instrument
- **Profit Calendar**: Daily performance mapped visually with heatmaps highlighting top-grossing days
- **AI Strategy Tracker**: Learns from trade history to refine strategies and spot patterns
- **Best & Worst Performing Timeframes**: Smart summaries based on historical performance
- **Risk/Reward Analysis**: Advanced calculations with visual representations

### 🧠 AI Coaching & Learning
- **AI Coach Dashboard**: Personalized feedback on strengths, weaknesses, and opportunities
- **Risk Analyzer**: Detects overexposure, leverage traps, and stop-loss vulnerabilities
- **Smart Journal**: Tag trades with emotional states and market context for AI correlation
- **Personal Challenges**: AI-generated challenges to improve specific weaknesses

### 📢 Automated Guidance & Notifications
- **Multi-Channel Notifications**: Telegram, push notifications, email alerts
- **Price Alerts**: Customizable conditions with real-time monitoring
- **Trade Entry/Exit Alerts**: Automatic notifications for trade events
- **Market Event Alerts**: Economic calendar and news-based notifications
- **Condition-Based Alerts**: Triggers when market behavior matches your top-performing setups
- **Mentorship Assistant**: AI-powered coach mode with tailored suggestions
- **Market Sentiment Overlay**: Global sentiment analysis before price action

### 🏆 Motivation & Mastery
- **Leaderboard**: Rank yourself against past performance, not just others
- **Personal Challenges**: AI-identified weaknesses with simulations and mini-objectives
- **Progress Tracking**: Visual progress indicators and achievement badges

### 🌐 World View & Market Coverage
- **Real-time Market News**: Live news feed with sentiment analysis
- **Economic Calendar**: High-impact events with forecast vs actual data
- **Market Sentiment Analysis**: AI-powered sentiment scoring
- **Symbol Extraction**: Automatic identification of relevant trading instruments
- **Dual Economic Calendars**: Macro events with risk signals plus sector-focused calendars
- **Market Sentiment Overlay**: Optional data layer showing global sentiment shifts
- **Multi-Instrument Analysis**: Support for major forex pairs and instruments

### 📝 Enhanced Trading Journal
- **Rich Text Editor**: Detailed trade notes with formatting
- **Screenshot Attachments**: Visual documentation of trades
- **Emotional State Tracking**: Mood and psychology monitoring
- **Strategy Tags**: Organized categorization of trading approaches
- **Lessons Learned**: Structured learning documentation
- **Rating System**: Performance self-assessment
- **CSV Export**: Data portability and backup

### 🎯 Paper Trading Simulation
- **Risk-free Environment**: Practice strategies without real money
- **Real-time Price Simulation**: Accurate market conditions
- **Portfolio Management**: Track simulated positions
- **Performance Analytics**: Comprehensive simulation metrics
- **Strategy Testing**: Validate approaches before live trading

### 💎 UI & Design
- **Holographic Theme**: Modern interface with contextual animations and responsive layout
- **Interactive Dashboards**: Tap, hover, or voice-control for quick insights
- **Accessibility Mode**: UI adapts to visual preferences and dark/light themes
- **Mobile Optimized**: Full responsive design for trading on the go

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS with custom holographic theme
- **Charts**: Recharts for data visualization
- **Backend**: Supabase (PostgreSQL + Real-time subscriptions)
- **Authentication**: Supabase Auth
- **Mobile**: Capacitor for native mobile deployment
- **AI Integration**: OpenAI GPT-4 + Groq for intelligent insights

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- MetaTrader 4/5 account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/quantum-risk-coach.git
   cd quantum-risk-coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_GROQ_API_KEY=your_groq_api_key
   ```

4. **Database Setup**
   ```bash
   # Run Supabase migrations
   npx supabase db push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

### Mobile Deployment

```bash
# Build for mobile
npm run build:mobile

# Open in Android Studio
npm run android:open

# Build APK
npm run build:apk
```

## 🔧 Comprehensive API Services

The platform includes a complete set of API services for all trading operations:

### Broker Integration Service
- **Multi-platform Connectivity**: MT4/5, Binance, Bybit, cTrader, KuCoin, OKX, MEXC
- **Auto-sync Management**: Configurable intervals and error handling
- **Reconciliation Reports**: Data integrity verification
- **Connection Status**: Real-time monitoring

### Analytics Service
- **Performance Metrics**: Risk-reward, profit factor, win rate calculations
- **Time-based Analysis**: Hourly, daily, monthly performance breakdowns
- **Position Comparison**: Long vs short analysis
- **Symbol Performance**: Instrument-specific metrics
- **Advanced Calculations**: Max drawdown, Sharpe ratio, trade duration

### Calendar Service
- **Heatmap Generation**: Visual performance calendar
- **Monthly Breakdowns**: Detailed period analysis
- **Trade Density**: Volume and frequency visualization

### Strategy Service
- **AI-powered Analysis**: OpenAI and Groq integration
- **Pattern Recognition**: Automatic strategy identification
- **Performance Insights**: Actionable recommendations
- **Risk Assessment**: Strategy-specific risk analysis

### Journal Service
- **Entry Management**: Create, update, and organize journal entries
- **CSV Export**: Data portability
- **Search and Filter**: Advanced entry discovery
- **Tagging System**: Organized categorization

### Notification Service
- **Multi-channel Delivery**: Telegram, push, email
- **Price Alerts**: Customizable conditions
- **Trade Notifications**: Entry/exit alerts
- **Market Events**: Economic calendar integration

### Market Service
- **Real-time News**: Live market updates
- **Economic Calendar**: High-impact events
- **Sentiment Analysis**: AI-powered market sentiment
- **Symbol Extraction**: Automatic instrument identification

### Paper Trading Service
- **Simulation Environment**: Risk-free trading
- **Position Management**: Open/close simulated trades
- **Performance Tracking**: Comprehensive metrics
- **Strategy Testing**: Validate approaches

### Portfolio Service
- **Live Updates**: Real-time portfolio tracking
- **Position Monitoring**: Current holdings and PnL
- **Asset Allocation**: Visual breakdown
- **Risk Distribution**: Portfolio risk analysis

### AI Service
- **OpenAI Integration**: GPT-4 powered insights
- **Groq Integration**: Real-time analysis
- **Trading Insights**: Personalized recommendations
- **Strategy Analysis**: AI-powered strategy evaluation

## 📱 Key Components

### Trade Builder
- **Advanced Setup Creation**: Define entry/exit points, stop-loss, take-profit
- **Risk Management**: Automatic R:R ratio calculations and position sizing
- **Strategy Tags**: Organize setups with custom tags and categories
- **Entry Conditions**: Set multiple conditions for trade execution
- **Template System**: Save and reuse successful setups

### Smart Journal
- **Emotional Tracking**: Tag trades with emotional states (confident, anxious, etc.)
- **Market Context**: Document market conditions and observations
- **AI Correlation**: Automatic pattern recognition from journal entries
- **Insight Generation**: AI-powered analysis of trading psychology
- **Progress Tracking**: Visual representation of emotional growth

### Personal Challenges
- **AI-Generated Challenges**: Based on identified weaknesses
- **Skill Building**: Focused exercises for specific trading skills
- **Progress Metrics**: Track completion and improvement
- **Reward System**: Achievements and badges for motivation
- **Difficulty Levels**: Beginner to advanced challenges

### Market Sentiment Overlay
- **Real-time Sentiment**: Global market sentiment analysis
- **Multi-Source Data**: Social media, news, technical indicators
- **Confidence Scoring**: Reliability metrics for sentiment data
- **Alert System**: Notifications for significant sentiment shifts
- **Historical Analysis**: Track sentiment changes over time

### AI Coach Dashboard
- **Personalized Insights**: AI-generated trading recommendations
- **Performance Analysis**: Deep dive into trading patterns
- **Weakness Identification**: Automatic detection of improvement areas
- **Strength Recognition**: Highlight and reinforce good practices
- **Adaptive Learning**: Coach improves with your trading history

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable Row Level Security (RLS)
3. Configure authentication providers
4. Set up real-time subscriptions

### MetaTrader Integration
1. Use Investor Password (read-only access)
2. Configure server settings
3. Enable real-time data streaming
4. Set up webhook endpoints

### AI Configuration
1. Configure OpenAI API for advanced insights
2. Set up Groq for real-time analysis
3. Configure sentiment analysis sources
4. Set up alert thresholds

## 📊 Database Schema

### Core Tables
- `profiles`: User account information
- `trades`: Trade history and performance data
- `trade_setups`: Saved trade configurations
- `journal_entries`: Smart journal entries with AI insights
- `challenges`: Personal challenge definitions and progress
- `sentiment_data`: Market sentiment analysis results

### Relationships
- User profiles link to all trading data
- Trades reference trade setups and journal entries
- Challenges track progress against user metrics
- Sentiment data correlates with trade performance

## 🎨 Customization

### Theme Customization
```css
/* Custom holographic colors */
:root {
  --holo-primary: 197 100% 50%;
  --holo-secondary: 283 89% 74%;
  --holo-accent: 142 76% 36%;
}
```

### Component Styling
```tsx
// Use holographic card styling
<Card className="holo-card">
  {/* Your content */}
</Card>

// Add glow effects
<div className="holo-glow">
  {/* Glowing element */}
</div>
```

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based auth
- **Investor Password**: Read-only MT4/5 access
- **Data Encryption**: All sensitive data encrypted
- **Rate Limiting**: API request throttling

## 📈 Performance Optimization

- **Lazy Loading**: Components load on demand
- **Virtual Scrolling**: Efficient large dataset rendering
- **Caching**: Intelligent data caching strategies
- **Mobile Optimization**: Touch-friendly interfaces
- **Bundle Splitting**: Optimized code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/yourusername/quantum-risk-coach/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/quantum-risk-coach/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/quantum-risk-coach/discussions)

## 🚀 Roadmap

### Phase 1 (Current)
- ✅ Core trading platform
- ✅ AI coaching system
- ✅ Risk management tools
- ✅ Mobile optimization

### Phase 2 (Next)
- 🔄 Advanced AI models
- 🔄 Social trading features
- 🔄 Advanced analytics
- 🔄 API marketplace

### Phase 3 (Future)
- 📋 Institutional features
- 📋 Multi-asset support
- 📋 Advanced automation
- 📋 Global expansion

---

**Built with ❤️ for traders who want to elevate their game**

*Qlarity - Where AI meets trading intelligence*

# Qlarity - Next-Gen Trading Intelligence

Advanced trading platform with AI-powered insights, real-time data, and comprehensive analytics. Built with React, TypeScript, and Capacitor for cross-platform mobile deployment.

## 🚀 Features

- **AI-Powered Trading Insights**: Get intelligent recommendations and analysis
- **Real-Time Market Data**: Live forex, crypto, and stock data
- **Advanced Analytics**: Comprehensive performance tracking and analysis
- **Trading Journal**: Detailed trade logging and analysis
- **Risk Management**: Advanced risk assessment and management tools
- **Multi-Platform Support**: Web, Android, and iOS applications
- **PWA Ready**: Progressive Web App with offline capabilities

## 📱 Mobile-First Design

This application is optimized for mobile devices with:

- **Responsive Design**: Adapts seamlessly to all screen sizes
- **Touch-Optimized Interface**: Large touch targets and smooth interactions
- **Mobile Navigation**: Bottom navigation bar for easy access
- **PWA Support**: Install as a native app on mobile devices
- **Offline Capabilities**: Works without internet connection
- **Mobile-Specific Features**: Optimized for trading on the go

## 🛠️ Mobile Development Setup

### Prerequisites

- Node.js 18+ and npm
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Capacitor CLI: `npm install -g @capacitor/cli`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd quantum-risk-coach

# Install dependencies
npm install

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add android
npx cap add ios  # macOS only
```

### Mobile Development Commands

```bash
# Build for mobile
npm run build:mobile

# Android development
npm run android:open      # Open in Android Studio
npm run android:run       # Run on connected device/emulator
npm run android:sync      # Sync changes to Android
npm run android:copy      # Copy web assets to Android

# iOS development (macOS only)
npm run ios:open          # Open in Xcode
npm run ios:run           # Run on connected device/simulator
npm run ios:sync          # Sync changes to iOS
npm run ios:copy          # Copy web assets to iOS

# General mobile commands
npm run mobile:sync       # Sync to all platforms
npm run mobile:copy       # Copy assets to all platforms
npm run mobile:serve      # Serve for mobile testing
```

### Mobile Configuration

The app is configured for mobile with:

- **Capacitor Config**: Optimized settings in `capacitor.config.ts`
- **PWA Manifest**: Mobile app-like experience in `public/manifest.json`
- **Mobile Hooks**: Device detection and responsive utilities
- **Touch Optimizations**: Enhanced touch interactions and gestures
- **Mobile Navigation**: Bottom navigation for easy access

### Building for Production

```bash
# Build APK for Android
npm run build:apk

# Build for iOS (requires Xcode)
npm run ios:build
```

## 🎨 Mobile UI Features

### Responsive Design
- **Mobile-First**: Designed primarily for mobile devices
- **Adaptive Layouts**: Automatically adjusts to screen size
- **Touch-Friendly**: Large buttons and touch targets
- **Gesture Support**: Swipe, pinch, and tap gestures

### Mobile Navigation
- **Bottom Navigation**: Quick access to key features
- **Slide-out Menu**: Full navigation on mobile
- **Search Integration**: Easy content discovery
- **Quick Actions**: Fast access to common tasks

### Mobile Optimizations
- **Performance**: Optimized for mobile performance
- **Battery Life**: Efficient power usage
- **Data Usage**: Minimal data consumption
- **Offline Support**: Works without internet

## 📱 Platform Support

### Android
- **Minimum SDK**: API 22 (Android 5.1)
- **Target SDK**: API 34 (Android 14)
- **Architecture**: ARM64, x86_64
- **Features**: Full native integration

### iOS
- **Minimum Version**: iOS 13.0
- **Target Version**: iOS 17.0
- **Devices**: iPhone, iPad
- **Features**: Native iOS integration

### Web (PWA)
- **Browsers**: Chrome, Safari, Firefox, Edge
- **Installation**: Add to home screen
- **Offline**: Service worker support
- **Features**: Full web functionality

## 🔧 Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Mobile Development Workflow

1. **Web Development**: Develop and test in browser
2. **Mobile Sync**: Sync changes to mobile platforms
3. **Platform Testing**: Test on actual devices
4. **Iteration**: Repeat development cycle

### Key Mobile Files

- `capacitor.config.ts` - Mobile configuration
- `src/hooks/use-mobile.tsx` - Mobile detection utilities
- `src/components/MobileBottomNav.tsx` - Mobile navigation
- `public/manifest.json` - PWA configuration
- `src/index.css` - Mobile-optimized styles

## 🚀 Deployment

### Web Deployment
- Build the project: `npm run build`
- Deploy the `dist` folder to your hosting provider
- Configure PWA settings in your hosting environment

### Mobile App Stores
- **Android**: Build APK/AAB and submit to Google Play Store
- **iOS**: Build IPA and submit to Apple App Store
- **PWA**: Deploy web version for app store alternatives

## 📊 Performance

### Mobile Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Optimization Features
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: WebP format with fallbacks
- **Caching**: Aggressive caching strategies
- **Compression**: Gzip/Brotli compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on both web and mobile
5. Submit a pull request

### Mobile Testing Checklist
- [ ] Test on Android device/emulator
- [ ] Test on iOS device/simulator (if available)
- [ ] Test PWA installation
- [ ] Test offline functionality
- [ ] Test touch interactions
- [ ] Test responsive design
- [ ] Test performance on slow networks

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For mobile-specific issues:
- Check the Capacitor documentation
- Review platform-specific requirements
- Test on actual devices
- Check network connectivity
- Verify PWA installation

---

**Qlarity** - Empowering traders with AI-driven insights across all platforms.

# Qlarity

A comprehensive trading risk management and analytics platform built with React, TypeScript, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Real-time Market Data**: Live forex, crypto, and stock data from multiple APIs
- **Economic Calendar**: Real economic events and market-moving data
- **Market Sentiment Analysis**: AI-powered sentiment analysis based on live data
- **Trading Journal**: Advanced journaling with emotional tracking and lessons learned
- **Risk Management**: Comprehensive risk analysis and position sizing tools
- **Performance Analytics**: Detailed performance metrics and analytics
- **Paper Trading**: Risk-free trading simulation with real market data
- **Mobile-First Design**: Optimized for mobile and tablet devices
- **PWA Support**: Installable as a native app on mobile devices

### Real Data Integration
The application integrates with multiple real data sources to provide authentic market information:

#### Market Data APIs
- **Alpha Vantage**: Real-time forex exchange rates
- **CoinGecko**: Live cryptocurrency prices and data
- **Yahoo Finance**: Stock market data and quotes
- **Trading Economics**: Economic calendar and indicators

#### News and Sentiment
- **News API**: Real-time financial news and market updates
- **Custom Sentiment Analysis**: AI-powered sentiment analysis of news and social media

#### Broker Integration
- **Binance**: Cryptocurrency trading data
- **Bybit**: Derivatives and crypto data
- **KuCoin**: Multi-asset trading platform
- **MT4/MT5**: Traditional forex broker integration

## 📱 Mobile-First Design

### Responsive Features
- **Touch-optimized UI**: Large touch targets and smooth interactions
- **Mobile navigation**: Bottom navigation bar for easy thumb access
- **Responsive grids**: Adaptive layouts for all screen sizes
- **Mobile gestures**: Swipe, pinch, and tap interactions
- **Offline support**: PWA capabilities for offline usage

### Mobile-Specific Components
- **MobileBottomNav**: Bottom navigation for mobile devices
- **Touch-friendly buttons**: Minimum 44px touch targets
- **Mobile-optimized cards**: Optimized spacing and typography
- **Safe area support**: Respects device notches and home indicators

## 🛠️ Real Data Setup

### Required API Keys

To enable real data functionality, you need to configure the following API keys in your `.env` file:

```bash
# Market Data APIs
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
VITE_NEWS_API_KEY=your_news_api_key_here
VITE_TRADING_ECONOMICS_API_KEY=your_trading_economics_api_key_here

# Additional Services
VITE_FRED_API_KEY=your_fred_api_key_here
VITE_FXCM_API_KEY=your_fxcm_api_key_here

# Broker APIs (for real trading data)
VITE_BINANCE_API_KEY=your_binance_api_key_here
VITE_BINANCE_SECRET_KEY=your_binance_secret_key_here
VITE_BYBIT_API_KEY=your_bybit_api_key_here
VITE_BYBIT_SECRET_KEY=your_bybit_secret_key_here
VITE_KUCOIN_API_KEY=your_kucoin_api_key_here
VITE_KUCOIN_SECRET_KEY=your_kucoin_secret_key_here

# MT4/MT5 Connection
VITE_MT4_SERVER=your_mt4_server_here
VITE_MT4_LOGIN=your_mt4_login_here
VITE_MT4_PASSWORD=your_mt4_password_here

# AI Services
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Development
VITE_DEV_MODE=false
VITE_ENABLE_MOCK_DATA=false
```

### API Key Sources

#### Free APIs (Recommended to start)
1. **Alpha Vantage**: [Get free API key](https://www.alphavantage.co/support/#api-key)
   - 500 requests per day free
   - Real-time forex data
   - Stock market data

2. **News API**: [Get free API key](https://newsapi.org/register)
   - 1,000 requests per day free
   - Financial news and market updates

3. **CoinGecko**: No API key required
   - Free cryptocurrency data
   - Rate limited but generous

#### Paid APIs (For production use)
1. **Trading Economics**: [Get API key](https://tradingeconomics.com/api/)
   - Economic calendar and indicators
   - Professional-grade data

2. **Yahoo Finance**: No API key required
   - Stock market data
   - Rate limited

### Data Validation

The application includes built-in API validation to ensure data integrity:

```typescript
// Check if API keys are configured
const apiValidation = realDataService.validateApiKeys();
if (!apiValidation.valid) {
  console.error(`Missing API keys: ${apiValidation.missing.join(', ')}`);
}
```

### Real Data Components

#### Economic Calendar
- **Real Source**: Trading Economics API
- **Data**: Economic events, impact levels, forecasts
- **Update Frequency**: Real-time
- **Fallback**: Clear indication when using simulated data

#### Market Sentiment
- **Real Source**: News API + Custom sentiment analysis
- **Data**: Market sentiment scores, confidence levels
- **Update Frequency**: Hourly
- **Fallback**: Simulated data with clear labeling

#### Quick Stats
- **Real Source**: Alpha Vantage, CoinGecko, Yahoo Finance
- **Data**: Live prices, changes, volumes
- **Update Frequency**: Real-time
- **Fallback**: Error states with clear messaging

#### Market News
- **Real Source**: News API
- **Data**: Financial news, sentiment analysis
- **Update Frequency**: Real-time
- **Fallback**: Simulated news with clear indication

### Data Authenticity Features

1. **API Status Indicators**: Real-time connection status for each data source
2. **Data Source Attribution**: Clear indication of data sources
3. **Last Update Timestamps**: Shows when data was last refreshed
4. **Error Handling**: Graceful fallbacks with clear error messages
5. **Rate Limiting**: Respects API rate limits
6. **Data Validation**: Validates data before display

### Simulated Data

When real APIs are not available, the application clearly indicates simulated data:

- **Orange warning badges** on simulated components
- **Clear disclaimers** explaining the data is for demonstration
- **API status indicators** showing connection state
- **Fallback messages** when APIs are unavailable

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API keys for real data (optional but recommended)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/quantum-risk-coach.git
cd quantum-risk-coach
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your API keys
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:5173
```

### Mobile Development

#### Android Development
```bash
# Install Android dependencies
npm run android:install

# Build for Android
npm run android:build

# Run on Android device/emulator
npm run android:run
```

#### iOS Development (macOS only)
```bash
# Install iOS dependencies
npm run ios:install

# Build for iOS
npm run ios:build

# Run on iOS device/simulator
npm run ios:run
```

#### PWA Development
```bash
# Build PWA
npm run build:pwa

# Preview PWA
npm run preview:pwa
```

## 📱 Mobile Development

### Capacitor Configuration
The app is configured for mobile deployment using Capacitor:

```typescript
// capacitor.config.ts
export default defineConfig({
  appId: 'com.quantumriskcoach.app',
  appName: 'Qlarity',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a'
    },
    StatusBar: {
      style: 'dark'
    }
  }
});
```

### Mobile-Specific Features
- **Touch-friendly UI**: Minimum 44px touch targets
- **Mobile navigation**: Bottom navigation bar
- **Responsive design**: Adapts to all screen sizes
- **PWA support**: Installable as native app
- **Offline capabilities**: Service worker for offline usage

### Mobile Commands
```bash
# Add mobile platforms
npm run mobile:add

# Sync web code to mobile
npm run mobile:sync

# Open in mobile IDE
npm run mobile:open

# Build mobile apps
npm run mobile:build
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Hooks
- **Mobile**: Capacitor
- **PWA**: Vite PWA Plugin
- **Charts**: Recharts
- **Icons**: Lucide React

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Feature components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── lib/                # Utility libraries
│   ├── realDataService.ts  # Real data integration
│   └── api.ts          # API services
├── integrations/       # Third-party integrations
└── types/              # TypeScript type definitions
```

### Real Data Architecture
```
realDataService.ts
├── Market Data APIs
│   ├── Alpha Vantage (Forex)
│   ├── CoinGecko (Crypto)
│   └── Yahoo Finance (Stocks)
├── News & Sentiment
│   ├── News API
│   └── Sentiment Analysis
├── Economic Data
│   └── Trading Economics
└── Broker Integration
    ├── Binance
    ├── Bybit
    └── KuCoin
```

## 🔧 Configuration

### Environment Variables
All API keys and configuration are managed through environment variables:

```bash
# Copy example file
cp env.example .env

# Edit with your keys
nano .env
```

### API Rate Limits
Be aware of API rate limits when using free tiers:

- **Alpha Vantage**: 500 requests/day (free)
- **News API**: 1,000 requests/day (free)
- **CoinGecko**: 50 calls/minute (free)
- **Yahoo Finance**: Rate limited

### Data Refresh Intervals
- **Market Data**: 1-5 minutes
- **News**: 15-30 minutes
- **Economic Calendar**: 1 hour
- **Sentiment**: 1 hour

## 🚀 Deployment

### Web Deployment
```bash
# Build for production
npm run build

# Preview build
npm run preview

# Deploy to Vercel
npm run deploy
```

### Mobile Deployment
```bash
# Build Android APK
npm run android:build

# Build iOS App
npm run ios:build

# Build PWA
npm run build:pwa
```

## 📊 Data Sources

### Real Data Providers
1. **Alpha Vantage**: Forex and stock data
2. **CoinGecko**: Cryptocurrency data
3. **News API**: Financial news
4. **Trading Economics**: Economic indicators
5. **Yahoo Finance**: Stock market data

### Data Quality
- **Real-time updates**: Live market data
- **Data validation**: API response validation
- **Error handling**: Graceful fallbacks
- **Rate limiting**: Respects API limits
- **Caching**: Optimized data fetching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API setup guide

## 🔮 Roadmap

### Upcoming Features
- [ ] Real-time broker integration
- [ ] Advanced charting with TradingView
- [ ] Social trading features
- [ ] AI-powered trade recommendations
- [ ] Advanced risk management tools
- [ ] Multi-language support
- [ ] Dark/light theme toggle
- [ ] Advanced notifications system

### Real Data Enhancements
- [ ] Additional broker integrations
- [ ] Real-time order execution
- [ ] Live portfolio tracking
- [ ] Advanced sentiment analysis
- [ ] Machine learning predictions
- [ ] Real-time alerts and notifications

## Lovable.dev Compatibility

### Migration Preparation

This project is prepared for potential migration to Lovable.dev. We've included several tools to help with the transition:

- `npm run lovable:prepare`: Prepares your project for Lovable.dev migration
- `npm run lovable:check-compatibility`: Runs compatibility checks
- `npm run lovable:migrate`: Initiates migration to Next.js (if applicable)

#### Compatibility Status
- ✅ React 18 Support
- ✅ TypeScript Configuration
- ✅ Tailwind CSS
- ✅ Mobile Development Ready
- 🔄 Recommended: Migrate to Next.js App Router

### Migration Considerations
- Review and update routing from React Router to Next.js App Router
- Verify Supabase and AI integration compatibility
- Test mobile capabilities after migration

For more details, check the `lovable.config.js` and `lovable-migration-report.json` files.

<!-- Trigger APK build - $(date) -->
