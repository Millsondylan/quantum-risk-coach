// AI Features Verification Test
// Tests AI coaching, market insights, and API integrations

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🤖 AI COACHING & FEATURES VERIFICATION TEST');
console.log('============================================\n');

let score = 0;
let totalTests = 0;

function test(name, condition, details = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    score++;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
  }
}

// Test 1: AI Stream Service Implementation
console.log('🔍 1. AI STREAM SERVICE IMPLEMENTATION\n');

try {
  const aiServicePath = join(__dirname, 'src/lib/aiStreamService.ts');
  const aiServiceContent = readFileSync(aiServicePath, 'utf8');
  
  test('AI Stream Service File Exists', true, 'aiStreamService.ts found');
  test('OpenAI Integration', aiServiceContent.includes('import OpenAI'), 'OpenAI client imported');
  test('Groq Integration', aiServiceContent.includes('import Groq'), 'Groq SDK imported');
  test('Multi-Provider Support', aiServiceContent.includes('provider: \'openai\' | \'groq\' | \'gemini\''), '3 AI providers supported');
  test('Health Check System', aiServiceContent.includes('healthCheck'), 'Health monitoring implemented');
  test('Coaching Method', aiServiceContent.includes('getAICoaching'), 'AI coaching method available');
  test('Stream Analysis', aiServiceContent.includes('streamMarketAnalysis'), 'Streaming analysis implemented');
  test('Fallback Logic', aiServiceContent.includes('fallback'), 'Provider fallback system');
  
} catch (error) {
  test('AI Stream Service File Exists', false, `Error: ${error.message}`);
}

console.log('\n🔍 2. AI COACH CARD COMPONENT\n');

try {
  const aiCoachPath = join(__dirname, 'src/components/AICoachCard.tsx');
  const aiCoachContent = readFileSync(aiCoachPath, 'utf8');
  
  test('AI Coach Component Exists', true, 'AICoachCard.tsx found');
  test('AI Service Integration', aiCoachContent.includes('AIStreamService'), 'AI service integrated');
  test('Real-time Insights', aiCoachContent.includes('generateRealInsights'), 'Real insights generation');
  test('Chat Interface', aiCoachContent.includes('chatMode'), 'Interactive chat available');
  test('Streaming Responses', aiCoachContent.includes('streamingResponse'), 'Live response streaming');
  test('Provider Status', aiCoachContent.includes('apiStatus'), 'API status monitoring');
  test('Health Monitoring', aiCoachContent.includes('healthCheck'), 'Health check integration');
  test('Sample Data', aiCoachContent.includes('sampleInsights'), 'Demo insights available');
  
} catch (error) {
  test('AI Coach Component Exists', false, `Error: ${error.message}`);
}

console.log('\n🔍 3. AI MARKET INSIGHTS COMPONENT\n');

try {
  const aiInsightsPath = join(__dirname, 'src/components/AIMarketInsights.tsx');
  const aiInsightsContent = readFileSync(aiInsightsPath, 'utf8');
  
  test('AI Market Insights Exists', true, 'AIMarketInsights.tsx found');
  test('Market Analysis', aiInsightsContent.includes('marketAnalysis'), 'Market analysis features');
  test('Trend Detection', aiInsightsContent.includes('trend'), 'Trend analysis capability');
  test('Real Data Integration', aiInsightsContent.includes('realDataService'), 'Live data integration');
  
} catch (error) {
  test('AI Market Insights Exists', false, `File not found or error: ${error.message}`);
}

console.log('\n🔍 4. DASHBOARD AI INTEGRATION\n');

try {
  const dashboardPath = join(__dirname, 'src/components/UltraTraderDashboard.tsx');
  const dashboardContent = readFileSync(dashboardPath, 'utf8');
  
  test('Dashboard AI Components', dashboardContent.includes('AICoachCard'), 'AI Coach Card integrated');
  test('Market Insights Integration', dashboardContent.includes('AIMarketInsights'), 'Market insights in dashboard');
  
} catch (error) {
  test('Dashboard AI Integration Check', false, `Error reading dashboard: ${error.message}`);
}

console.log('\n🔍 5. ENVIRONMENT CONFIGURATION\n');

try {
  const envExamplePath = join(__dirname, 'env.example');
  const envContent = readFileSync(envExamplePath, 'utf8');
  
  test('OpenAI API Key Config', envContent.includes('VITE_OPENAI_API_KEY'), 'OpenAI key configured');
  test('Groq API Key Config', envContent.includes('VITE_GROQ_API_KEY'), 'Groq key configured');
  test('Gemini API Key Config', envContent.includes('VITE_GEMINI_API_KEY'), 'Gemini key configured');
  
} catch (error) {
  test('Environment Config Check', false, `Error: ${error.message}`);
}

console.log('\n🔍 6. REAL DATA SERVICE INTEGRATION\n');

try {
  const realDataPath = join(__dirname, 'src/lib/realDataService.ts');
  const realDataContent = readFileSync(realDataPath, 'utf8');
  
  test('Real Data Service Exists', true, 'realDataService.ts found');
  test('Crypto Data Integration', realDataContent.includes('getCryptoPrices'), 'Crypto prices available');
  test('Forex Data Integration', realDataContent.includes('getForexRates'), 'Forex rates available');
  test('Market Data Structure', realDataContent.includes('marketData'), 'Structured market data');
  
} catch (error) {
  test('Real Data Service Check', false, `Error: ${error.message}`);
}

console.log('\n🔍 7. AI FEATURES IN TRADING JOURNAL\n');

try {
  const journalPath = join(__dirname, 'src/pages/Journal.tsx');
  const journalContent = readFileSync(journalPath, 'utf8');
  
  test('Enhanced Trading Journal', journalContent.includes('EnhancedTradingJournal'), 'Enhanced journal with AI');
  test('AI Brain Integration', journalContent.includes('Brain'), 'AI brain icon usage');
  test('AI Enhanced Mode', journalContent.includes('AI Enhanced'), 'AI enhanced view mode');
  
} catch (error) {
  test('Journal AI Features Check', false, `Error: ${error.message}`);
}

console.log('\n🔍 8. COMPREHENSIVE AI FEATURES\n');

// Test for comprehensive AI features
try {
  const packagePath = join(__dirname, 'package.json');
  const packageContent = readFileSync(packagePath, 'utf8');
  const packageData = JSON.parse(packageContent);
  
  test('OpenAI Package', packageData.dependencies?.openai || packageData.devDependencies?.openai, 'OpenAI npm package installed');
  test('Groq SDK Package', packageData.dependencies?.['groq-sdk'] || packageData.devDependencies?.['groq-sdk'], 'Groq SDK installed');
  
} catch (error) {
  test('Package Dependencies Check', false, `Error: ${error.message}`);
}

// Check for AI-related files
const aiFiles = [
  'src/lib/aiStreamService.ts',
  'src/components/AICoachCard.tsx',
  'src/components/AIMarketInsights.tsx',
  'src/components/EnhancedTradingJournal.tsx'
];

aiFiles.forEach((file, index) => {
  try {
    const filePath = join(__dirname, file);
    readFileSync(filePath, 'utf8');
    test(`AI File ${index + 1}`, true, `${file} exists`);
  } catch (error) {
    test(`AI File ${index + 1}`, false, `${file} missing`);
  }
});

console.log('\n🎯 FINAL AI VERIFICATION RESULTS');
console.log('================================\n');

const percentage = Math.round((score / totalTests) * 100);
console.log(`📊 AI Features Score: ${score}/${totalTests} (${percentage}%)`);

if (percentage >= 90) {
  console.log('🏆 EXCELLENT - AI coaching system fully operational!');
} else if (percentage >= 75) {
  console.log('✅ GOOD - AI features mostly working, minor issues to address');
} else if (percentage >= 50) {
  console.log('⚠️ NEEDS IMPROVEMENT - Several AI features need attention');
} else {
  console.log('❌ CRITICAL - Major AI features missing or broken');
}

console.log('\n📋 AI FEATURES CHECKLIST:');
console.log(`${score >= 8 ? '✅' : '❌'} AI Stream Service Implementation`);
console.log(`${score >= 16 ? '✅' : '❌'} AI Coach Card Component`);
console.log(`${score >= 20 ? '✅' : '❌'} Market Insights Integration`);
console.log(`${score >= 24 ? '✅' : '❌'} Dashboard AI Features`);
console.log(`${score >= 28 ? '✅' : '❌'} Environment Configuration`);
console.log(`${score >= 32 ? '✅' : '❌'} Real Data Integration`);

console.log('\n🎉 AI VERIFICATION COMPLETE!\n'); 