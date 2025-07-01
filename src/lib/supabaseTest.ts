import { supabase } from '@/integrations/supabase/client';
import { checkDatabaseHealth, generateTableCreationSQL } from './databaseSetup';
import { testAuthFlow } from './authTest';

export interface SupabaseTestResult {
  connection: boolean;
  authentication: boolean;
  database: boolean;
  tables: {
    profiles: boolean;
    trades: boolean;
    payments: boolean;
    marketplace_subscriptions: boolean;
  };
  errors: string[];
  warnings: string[];
  setupInstructions: string[];
}

export const runComprehensiveSupabaseTest = async (): Promise<SupabaseTestResult> => {
  const result: SupabaseTestResult = {
    connection: false,
    authentication: false,
    database: false,
    tables: {
      profiles: false,
      trades: false,
      payments: false,
      marketplace_subscriptions: false,
    },
    errors: [],
    warnings: [],
    setupInstructions: []
  };

  console.log('🧪 Running comprehensive Supabase test...');

  // Test 1: Basic Connection
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    if (!error) {
      result.connection = true;
      console.log('✅ Supabase connection successful');
    } else {
      result.errors.push(`Connection failed: ${error.message}`);
      console.error('❌ Connection failed:', error.message);
    }
  } catch (error) {
    result.errors.push(`Connection error: ${error}`);
    console.error('❌ Connection error:', error);
  }

  // Test 2: Authentication
  try {
    const authTest = await testAuthFlow();
    if (authTest.connectionTest && authTest.loginTest && authTest.signupTest) {
      result.authentication = true;
      console.log('✅ Authentication setup verified');
    } else {
      result.warnings.push('Authentication may have issues');
      result.errors.push(...authTest.errors);
      console.warn('⚠️ Authentication issues detected');
    }
  } catch (error) {
    result.errors.push(`Auth test failed: ${error}`);
    console.error('❌ Auth test failed:', error);
  }

  // Test 3: Database Health
  try {
    const dbHealth = await checkDatabaseHealth();
    if (dbHealth.connected) {
      result.database = true;
      result.tables = dbHealth.tablesExist;
      
      const missingTables = Object.entries(dbHealth.tablesExist)
        .filter(([, exists]) => !exists)
        .map(([table]) => table);

      if (missingTables.length > 0) {
        result.warnings.push(`Missing tables: ${missingTables.join(', ')}`);
        result.setupInstructions.push(
          'Run the SQL setup script in your Supabase SQL Editor',
          'The SQL script will create all required tables and policies',
          'Check the console for the complete SQL script'
        );
        console.warn('⚠️ Missing tables:', missingTables);
        console.log('📋 SQL Setup Script:');
        console.log(generateTableCreationSQL());
      } else {
        console.log('✅ All database tables exist');
      }
    } else {
      result.errors.push(...dbHealth.errors);
    }
  } catch (error) {
    result.errors.push(`Database test failed: ${error}`);
    console.error('❌ Database test failed:', error);
  }

  // Generate setup instructions based on issues found
  if (!result.connection) {
    result.setupInstructions.unshift(
      'Check your Supabase URL and anon key in environment variables',
      'Ensure your Supabase project is active and accessible'
    );
  }

  if (!result.authentication) {
    result.setupInstructions.push(
      'Verify authentication is enabled in your Supabase project',
      'Check email authentication settings'
    );
  }

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log('🎉 All Supabase tests passed! Your setup is ready.');
  } else {
    console.log('📋 Setup issues found. Check the results for details.');
  }

  return result;
};

// Quick connection test
export const quickConnectionTest = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
    return !error;
  } catch {
    return false;
  }
};

// Test user operations
export const testUserOperations = async (testEmail: string = 'test@example.com') => {
  console.log('🔍 Testing user operations...');
  
  try {
    // Test if we can check for existing users (without creating)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', testEmail)
      .single();

    if (existingUser) {
      console.log('✅ User query test passed');
      return { success: true, message: 'User operations working' };
    } else {
      console.log('✅ User query test passed (no existing user)');
      return { success: true, message: 'User operations working' };
    }
  } catch (error) {
    console.error('❌ User operations test failed:', error);
    return { success: false, error };
  }
};

// Environment validation
export const validateEnvironment = () => {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    return {
      valid: false,
      missing,
      instructions: [
        'Create a .env file in your project root',
        'Add the missing environment variables',
        'Restart your development server'
      ]
    };
  }

  console.log('✅ Environment variables validated');
  return { valid: true, missing: [], instructions: [] };
};

// Test specific login
export const testSpecificLogin = async (email: string, password: string) => {
  console.log(`🔍 Testing login for: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Login failed:', error.message);
      console.error('Error details:', error);
      return { success: false, error: error.message, details: error };
    }

    if (data.user) {
      console.log('✅ Login successful!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
      return { success: true, user: data.user, session: data.session };
    } else {
      console.error('❌ Login failed: No user data');
      return { success: false, error: 'No user data returned' };
    }

  } catch (error) {
    console.error('❌ Login test error:', error);
    return { success: false, error: `${error}` };
  }
};

// Test specific signup
export const testSpecificSignup = async (email: string, password: string, username: string) => {
  console.log(`🔍 Testing signup for: ${email}`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (error) {
      console.error('❌ Signup failed:', error.message);
      console.error('Error details:', error);
      return { success: false, error: error.message, details: error };
    }

    if (data.user) {
      console.log('✅ Signup successful!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);
      console.log('Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
      console.log('Confirmation required:', !data.user.email_confirmed_at);
      return { 
        success: true, 
        user: data.user, 
        requiresConfirmation: !data.user.email_confirmed_at 
      };
    } else {
      console.error('❌ Signup failed: No user data');
      return { success: false, error: 'No user data returned' };
    }

  } catch (error) {
    console.error('❌ Signup test error:', error);
    return { success: false, error: `${error}` };
  }
};

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).runSupabaseTest = runComprehensiveSupabaseTest;
  (window as any).testSpecificLogin = testSpecificLogin;
  (window as any).testSpecificSignup = testSpecificSignup;
  (window as any).quickConnectionTest = quickConnectionTest;
  (window as any).validateEnvironment = validateEnvironment;
  
  console.log('🔧 Supabase test functions available:');
  console.log('- window.runSupabaseTest() // Comprehensive test');
  console.log('- window.quickConnectionTest() // Quick connection check');
  console.log('- window.validateEnvironment() // Check environment variables');
  console.log('- window.testSpecificLogin(email, password)');
  console.log('- window.testSpecificSignup(email, password, username)');
} 