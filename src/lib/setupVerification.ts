// Placeholder functions for missing modules
const runComprehensiveSupabaseTest = async () => ({
  connection: false,
  authentication: false,
  database: false,
  tables: {}
});

const validateEnvironment = () => ({
  valid: false,
  instructions: ['Environment validation not implemented']
});

const setupTradingTables = async () => false;

const generateTableCreationSQL = () => '-- SQL setup not implemented';

const testAuthFlow = async () => ({
  errors: ['Auth test not implemented']
});

export interface SetupStatus {
  environment: boolean;
  supabaseConnection: boolean;
  authentication: boolean;
  database: boolean;
  allTablesExist: boolean;
  ready: boolean;
  issues: string[];
  instructions: string[];
}

export interface ApiKeyStatus {
  key: string;
  configured: boolean;
  provider: string;
  type: 'market-data' | 'forex' | 'crypto' | 'news' | 'ai';
}

export const verifyCompleteSetup = async (): Promise<SetupStatus> => {
  const status: SetupStatus = {
    environment: false,
    supabaseConnection: false,
    authentication: false,
    database: false,
    allTablesExist: false,
    ready: false,
    issues: [],
    instructions: []
  };

  console.log('�� Verifying complete Qlarity setup...');

  // Step 1: Environment Variables
  console.log('\n1️⃣ Checking environment variables...');
  const envCheck = validateEnvironment();
  status.environment = envCheck.valid;
  
  if (!envCheck.valid) {
    status.issues.push('Missing environment variables');
    status.instructions.push(...envCheck.instructions);
    console.error('❌ Environment check failed');
    return status; // Can't continue without env vars
  }
  console.log('✅ Environment variables OK');

  // Step 2: Supabase Connection
  console.log('\n2️⃣ Testing Supabase connection...');
  try {
    const supabaseTest = await runComprehensiveSupabaseTest();
    status.supabaseConnection = supabaseTest.connection;
    status.authentication = supabaseTest.authentication;
    status.database = supabaseTest.database;
    status.allTablesExist = Object.values(supabaseTest.tables).every(exists => exists);

    if (!status.supabaseConnection) {
      status.issues.push('Supabase connection failed');
      status.instructions.push(
        'Check your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY',
        'Ensure your Supabase project is active'
      );
    }

    if (!status.authentication) {
      status.issues.push('Authentication setup incomplete');
      status.instructions.push(
        'Enable email authentication in Supabase',
        'Configure email templates if needed'
      );
    }

    if (!status.allTablesExist) {
      status.issues.push('Database tables missing');
      status.instructions.push(
        'Run the SQL setup script in Supabase SQL Editor',
        'The complete SQL script is shown in the console'
      );
      console.log('\n📋 Required SQL Setup Script:');
      console.log('Copy and paste this into your Supabase SQL Editor:');
      console.log('='.repeat(60));
      console.log(generateTableCreationSQL());
      console.log('='.repeat(60));
    }

  } catch (error) {
    status.issues.push(`Supabase test failed: ${error}`);
    console.error('❌ Supabase test failed:', error);
  }

  // Step 3: Database Tables
  console.log('\n3️⃣ Verifying database tables...');
  try {
    const dbSetup = await setupTradingTables();
    if (dbSetup) {
      console.log('✅ Database tables verified');
    } else {
      status.issues.push('Database tables not properly configured');
    }
  } catch (error) {
    status.issues.push(`Database verification failed: ${error}`);
    console.error('❌ Database verification failed:', error);
  }

  // Step 4: Authentication Flow
  console.log('\n4️⃣ Testing authentication flow...');
  try {
    const authTest = await testAuthFlow();
    if (authTest.errors.length === 0) {
      console.log('✅ Authentication flow working');
    } else {
      status.issues.push('Authentication flow has issues');
      status.instructions.push('Check authentication configuration');
    }
  } catch (error) {
    status.issues.push(`Auth test failed: ${error}`);
    console.error('❌ Auth test failed:', error);
  }

  // Final assessment
  status.ready = status.environment && 
                 status.supabaseConnection && 
                 status.authentication && 
                 status.database && 
                 status.allTablesExist;

  console.log('\n📊 Setup Verification Results:');
  console.log(`Environment: ${status.environment ? '✅' : '❌'}`);
  console.log(`Supabase Connection: ${status.supabaseConnection ? '✅' : '❌'}`);
  console.log(`Authentication: ${status.authentication ? '✅' : '❌'}`);
  console.log(`Database: ${status.database ? '✅' : '❌'}`);
  console.log(`All Tables: ${status.allTablesExist ? '✅' : '❌'}`);
  console.log(`Overall Ready: ${status.ready ? '🎉' : '⚠️'}`);

  if (status.ready) {
    console.log('\n🎉 Congratulations! Your Qlarity setup is complete and ready to use!');
  } else {
    console.log('\n⚠️ Setup incomplete. Please address the following issues:');
    status.issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`);
    });
    
    if (status.instructions.length > 0) {
      console.log('\n📋 Next Steps:');
      status.instructions.forEach((instruction, index) => {
        console.log(`${index + 1}. ${instruction}`);
      });
    }
  }

  return status;
};

export const quickHealthCheck = async (): Promise<boolean> => {
  try {
    const envOk = validateEnvironment().valid;
    if (!envOk) return false;

    const dbOk = await setupTradingTables();
    if (!dbOk) return false;

    const authOk = (await testAuthFlow()).errors.length === 0;
    return authOk;
  } catch {
    return false;
  }
};

// Setup instructions for common issues
export const getSetupInstructions = () => {
  return {
    environment: [
      'Create a .env file in your project root',
      'Copy contents from env.example',
      'Fill in your Supabase URL and anon key',
      'Restart your development server'
    ],
    
    supabase: [
      'Create a new project at https://supabase.com',
      'Copy your project URL and anon key to .env',
      'Enable email authentication in Authentication settings',
      'Run the provided SQL script in SQL Editor'
    ],
    
    database: [
      'Go to your Supabase project dashboard',
      'Open the SQL Editor',
      'Create a new query',
      'Paste the complete SQL setup script',
      'Click Run to create all tables and policies'
    ],
    
    authentication: [
      'Enable email/password authentication in Supabase',
      'Configure email templates (optional)',
      'Set up email confirmation if needed',
      'Test signup/login functionality'
    ]
  };
};

// Expose to window for debugging
if (typeof window !== 'undefined') {
  (window as any).verifySetup = verifyCompleteSetup;
  (window as any).quickHealthCheck = quickHealthCheck;
  (window as any).getSetupInstructions = getSetupInstructions;
  
  console.log('🛠️ Setup verification functions available:');
  console.log('- window.verifySetup() // Complete setup verification');
  console.log('- window.quickHealthCheck() // Quick health check');
  console.log('- window.getSetupInstructions() // Get setup help');
}

export async function verifyApiKeys(): Promise<ApiKeyStatus[]> {
  const apiKeyStatus: ApiKeyStatus[] = [];
  
  // Check Data API Keys
  const dataApiKeys = [
    { name: 'VITE_ALPHA_VANTAGE_API_KEY', provider: 'Alpha Vantage', type: 'market-data' },
    { name: 'VITE_POLYGON_API_KEY', provider: 'Polygon.io', type: 'market-data' },
    { name: 'VITE_EXCHANGERATE_API_KEY', provider: 'ExchangeRate API', type: 'forex' },
    { name: 'VITE_FIXER_API_KEY', provider: 'Fixer', type: 'forex' },
    { name: 'VITE_FMP_API_KEY', provider: 'Financial Modeling Prep', type: 'market-data' },
    { name: 'VITE_ETHERSCAN_API_KEY', provider: 'Etherscan', type: 'crypto' },
    { name: 'VITE_FINNHUB_API_KEY', provider: 'Finnhub', type: 'market-data' },
    { name: 'VITE_COINGECKO_API_KEY', provider: 'CoinGecko', type: 'crypto' },
    { name: 'VITE_NEWS_API_KEY', provider: 'NewsAPI', type: 'news' },
    { name: 'VITE_YFINANCE_API_KEY', provider: 'Yahoo Finance', type: 'market-data' }
  ];
  
  // Check AI API Keys
  const aiApiKeys = [
    { name: 'VITE_OPENAI_API_KEY', provider: 'OpenAI', type: 'ai' },
    { name: 'VITE_GROQ_API_KEY', provider: 'Groq', type: 'ai' },
    { name: 'VITE_GEMINI_API_KEY', provider: 'Gemini', type: 'ai' }
  ];
  
  // Check all data API keys
  for (const keyInfo of dataApiKeys) {
    const value = import.meta.env[keyInfo.name];
    const configured = value && value !== '' && value !== 'your-api-key-here';
    
    apiKeyStatus.push({
      key: keyInfo.name,
      configured,
      provider: keyInfo.provider,
      type: keyInfo.type as any
    });
  }
  
  // Check all AI API keys
  for (const keyInfo of aiApiKeys) {
    const value = import.meta.env[keyInfo.name];
    const configured = value && value !== '' && value !== 'your-api-key-here';
    
    apiKeyStatus.push({
      key: keyInfo.name,
      configured,
      provider: keyInfo.provider,
      type: keyInfo.type as any
    });
  }
  
  return apiKeyStatus;
}

export async function testApiConnection(apiKey: ApiKeyStatus): Promise<boolean> {
  try {
    // Test specific APIs based on provider
    switch (apiKey.provider) {
      case 'CoinGecko':
        const cgResponse = await fetch('https://api.coingecko.com/api/v3/ping');
        return cgResponse.ok;
        
      case 'NewsAPI':
        if (import.meta.env.VITE_NEWS_API_KEY) {
          const newsResponse = await fetch(`https://newsapi.org/v2/sources?apiKey=${import.meta.env.VITE_NEWS_API_KEY}`);
          return newsResponse.ok;
        }
        return false;
        
      case 'OpenAI':
        if (import.meta.env.VITE_OPENAI_API_KEY) {
          const openaiResponse = await fetch('https://api.openai.com/v1/models', {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
            }
          });
          return openaiResponse.ok;
        }
        return false;
        
      // Add more specific tests as needed
      default:
        return apiKey.configured;
    }
  } catch (error) {
    console.error(`Error testing ${apiKey.provider} API:`, error);
    return false;
  }
} 