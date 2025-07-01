#!/usr/bin/env node

// Quantum Risk Coach - API Key Validation Script
// Validates all API keys are configured for APK production

import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(color, prefix, message) {
    console.log(`${color}[${prefix}]${colors.reset} ${message}`);
}

function logInfo(message) { log(colors.blue, 'INFO', message); }
function logSuccess(message) { log(colors.green, 'SUCCESS', message); }
function logWarning(message) { log(colors.yellow, 'WARNING', message); }
function logError(message) { log(colors.red, 'ERROR', message); }

console.log(`${colors.cyan}🔍 Quantum Risk Coach - API Key Validation${colors.reset}`);
console.log('='.repeat(50));

// Check if .env file exists
const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
    logError('.env file not found');
    logInfo('Creating .env from template...');
    
    const examplePath = path.join(process.cwd(), 'env.example');
    if (fs.existsSync(examplePath)) {
        fs.copyFileSync(examplePath, envPath);
        logSuccess('.env file created from env.example');
        logWarning('Please update .env with your actual API keys');
    } else {
        logError('env.example not found either');
        process.exit(1);
    }
}

// Read .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

// Parse .env file
envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key && value) {
            envVars[key] = value;
        }
    }
});

// Define required API keys for APK production
const requiredKeys = {
    // Core Services
    'VITE_SUPABASE_URL': {
        name: 'Supabase URL',
        category: 'Authentication',
        critical: true
    },
    'VITE_SUPABASE_ANON_KEY': {
        name: 'Supabase Anonymous Key',
        category: 'Authentication', 
        critical: true,
        pattern: /^eyJ/
    },
    
    // AI Providers
    'VITE_OPENAI_API_KEY': {
        name: 'OpenAI API Key',
        category: 'AI Services',
        critical: true,
        pattern: /^sk-/
    },
    'VITE_GROQ_API_KEY': {
        name: 'Groq API Key',
        category: 'AI Services',
        critical: true,
        pattern: /^gsk_/
    },
    'VITE_GEMINI_API_KEY': {
        name: 'Google Gemini API Key',
        category: 'AI Services',
        critical: true,
        pattern: /^AIza/
    },
    
    // Market Data APIs
    'VITE_YFINANCE_API_KEY': {
        name: 'Yahoo Finance API Key',
        category: 'Market Data',
        critical: true
    },
    'VITE_COINGECKO_API_KEY': {
        name: 'CoinGecko API Key',
        category: 'Market Data',
        critical: true,
        pattern: /^CG-/
    },
    'VITE_ALPHA_VANTAGE_API_KEY': {
        name: 'Alpha Vantage API Key',
        category: 'Market Data',
        critical: true
    },
    'VITE_POLYGON_API_KEY': {
        name: 'Polygon.io API Key',
        category: 'Market Data',
        critical: true
    },
    'VITE_EXCHANGERATE_API_KEY': {
        name: 'ExchangeRate API Key',
        category: 'Market Data',
        critical: true
    },
    'VITE_FIXER_API_KEY': {
        name: 'Fixer.io API Key',
        category: 'Market Data',
        critical: true
    },
    'VITE_FMP_API_KEY': {
        name: 'Financial Modeling Prep API Key',
        category: 'Market Data',
        critical: true
    },
    'VITE_ETHERSCAN_API_KEY': {
        name: 'Etherscan API Key',
        category: 'Market Data',
        critical: true
    },
    'VITE_FINNHUB_API_KEY': {
        name: 'Finnhub API Key',
        category: 'Market Data',
        critical: true
    },
    'VITE_NEWS_API_KEY': {
        name: 'News API Key',
        category: 'Market Data',
        critical: true
    },
    
    // Messaging
    'VITE_TELEGRAM_BOT_TOKEN': {
        name: 'Telegram Bot Token',
        category: 'Messaging',
        critical: true,
        pattern: /^\d+:/
    }
};

// Validation results
const results = {
    total: 0,
    valid: 0,
    missing: 0,
    placeholder: 0,
    categories: {}
};

console.log();
logInfo('Validating API keys...');
console.log();

// Validate each required key
Object.entries(requiredKeys).forEach(([key, config]) => {
    results.total++;
    
    if (!results.categories[config.category]) {
        results.categories[config.category] = { valid: 0, total: 0 };
    }
    results.categories[config.category].total++;
    
    const value = envVars[key];
    
    if (!value) {
        logError(`${config.name}: Missing`);
        results.missing++;
        return;
    }
    
    // Check for placeholder values
    if (value.includes('your_') && value.includes('_here')) {
        logWarning(`${config.name}: Placeholder value detected`);
        results.placeholder++;
        return;
    }
    
    // Check pattern if provided
    if (config.pattern && !config.pattern.test(value)) {
        logWarning(`${config.name}: Value doesn't match expected pattern`);
    }
    
    logSuccess(`${config.name}: ✓ Configured`);
    results.valid++;
    results.categories[config.category].valid++;
});

// Summary
console.log();
console.log(`${colors.cyan}📊 Validation Summary${colors.reset}`);
console.log('='.repeat(30));

console.log(`Total API Keys: ${results.total}`);
console.log(`${colors.green}Valid: ${results.valid}${colors.reset}`);
console.log(`${colors.yellow}Missing: ${results.missing}${colors.reset}`);
console.log(`${colors.yellow}Placeholders: ${results.placeholder}${colors.reset}`);

console.log();
console.log(`${colors.cyan}📈 By Category:${colors.reset}`);
Object.entries(results.categories).forEach(([category, stats]) => {
    const percentage = Math.round((stats.valid / stats.total) * 100);
    const status = percentage === 100 ? colors.green : colors.yellow;
    console.log(`${status}${category}: ${stats.valid}/${stats.total} (${percentage}%)${colors.reset}`);
});

// Overall status
const overallPercentage = Math.round((results.valid / results.total) * 100);
console.log();

if (overallPercentage === 100) {
    logSuccess(`🎉 All API keys configured! Ready for APK build.`);
    console.log();
    console.log(`${colors.cyan}🚀 Next Steps:${colors.reset}`);
    console.log(`1. Run: ${colors.yellow}./scripts/build-apk-production.sh${colors.reset}`);
    console.log(`2. Test APK on Android device`);
    console.log(`3. Sign for production release`);
    
    process.exit(0);
} else if (overallPercentage >= 85) {
    logWarning(`⚠️  Most API keys configured (${overallPercentage}%). APK build possible but some features may not work.`);
    process.exit(1);
} else {
    logError(`❌ Too many missing API keys (${overallPercentage}% configured). Please update .env file.`);
    console.log();
    console.log(`${colors.yellow}📝 Required Actions:${colors.reset}`);
    console.log(`1. Edit .env file with actual API keys`);
    console.log(`2. Replace all placeholder values (your_*_here)`);
    console.log(`3. Run this script again to validate`);
    
    process.exit(1);
} 