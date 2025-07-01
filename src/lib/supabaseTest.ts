import { supabase } from '@/integrations/supabase/client';

export const runSupabaseTest = async () => {
  console.log('🔍 Running comprehensive Supabase test...');
  
  const results = {
    connection: false,
    auth: false,
    database: false,
    errors: [] as string[]
  };

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      results.errors.push(`Session error: ${sessionError.message}`);
      console.error('❌ Session test failed:', sessionError);
    } else {
      results.connection = true;
      console.log('✅ Basic connection successful');
    }

    // Test 2: Auth methods
    console.log('2. Testing auth methods...');
    try {
      // Test if auth methods are available
      if (typeof supabase.auth.signInWithPassword === 'function' && 
          typeof supabase.auth.signUp === 'function') {
        results.auth = true;
        console.log('✅ Auth methods available');
      } else {
        results.errors.push('Auth methods not available');
        console.error('❌ Auth methods not available');
      }
    } catch (error) {
      results.errors.push(`Auth test error: ${error}`);
      console.error('❌ Auth test failed:', error);
    }

    // Test 3: Database connection
    console.log('3. Testing database connection...');
    try {
      const { data: dbData, error: dbError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact' })
        .limit(1);
      
      if (dbError) {
        results.errors.push(`Database error: ${dbError.message}`);
        console.error('❌ Database test failed:', dbError);
      } else {
        results.database = true;
        console.log('✅ Database connection successful');
      }
    } catch (error) {
      results.errors.push(`Database test error: ${error}`);
      console.error('❌ Database test failed:', error);
    }

    // Test 4: Current auth state
    console.log('4. Checking current auth state...');
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        console.log('✅ User is logged in:', userData.user.email);
      } else {
        console.log('ℹ️ No user currently logged in');
      }
    } catch (error) {
      console.warn('⚠️ Could not get current user:', error);
    }

    // Summary
    console.log('\n📊 Test Results:');
    console.log(`Connection: ${results.connection ? '✅' : '❌'}`);
    console.log(`Auth Methods: ${results.auth ? '✅' : '❌'}`);
    console.log(`Database: ${results.database ? '✅' : '❌'}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Errors found:');
      results.errors.forEach(error => console.log(`- ${error}`));
    } else {
      console.log('\n✅ All tests passed!');
    }

    return results;

  } catch (error) {
    console.error('❌ Supabase test failed:', error);
    results.errors.push(`Test failed: ${error}`);
    return results;
  }
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
  (window as any).runSupabaseTest = runSupabaseTest;
  (window as any).testSpecificLogin = testSpecificLogin;
  (window as any).testSpecificSignup = testSpecificSignup;
  
  console.log('🔧 Supabase test functions available:');
  console.log('- window.runSupabaseTest()');
  console.log('- window.testSpecificLogin(email, password)');
  console.log('- window.testSpecificSignup(email, password, username)');
} 