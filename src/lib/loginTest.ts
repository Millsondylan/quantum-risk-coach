import { supabase } from '@/integrations/supabase/client';

export const testLoginFlow = async (email: string, password: string) => {
  console.log('🔍 Testing login flow...');
  console.log('Email:', email);
  
  try {
    // Test 1: Check if we can reach Supabase
    console.log('1. Testing Supabase connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
      return { success: false, error: sessionError.message };
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test 2: Attempt login
    console.log('2. Attempting login...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Login failed:', error.message);
      return { success: false, error: error.message };
    }
    
    if (data.user) {
      console.log('✅ Login successful!');
      console.log('User ID:', data.user.id);
      console.log('User Email:', data.user.email);
      console.log('Session:', data.session ? 'Active' : 'No session');
      
      return { 
        success: true, 
        user: data.user,
        session: data.session 
      };
    } else {
      console.error('❌ Login failed: No user data returned');
      return { success: false, error: 'No user data returned' };
    }
    
  } catch (error) {
    console.error('❌ Login test error:', error);
    return { success: false, error: `${error}` };
  }
};

export const testSignupFlow = async (email: string, password: string, username: string) => {
  console.log('🔍 Testing signup flow...');
  console.log('Email:', email);
  console.log('Username:', username);
  
  try {
    // Test 1: Check if we can reach Supabase
    console.log('1. Testing Supabase connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
      return { success: false, error: sessionError.message };
    }
    
    console.log('✅ Supabase connection successful');
    
    // Test 2: Attempt signup
    console.log('2. Attempting signup...');
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });
    
    if (error) {
      console.error('❌ Signup failed:', error.message);
      return { success: false, error: error.message };
    }
    
    if (data.user) {
      console.log('✅ Signup successful!');
      console.log('User ID:', data.user.id);
      console.log('User Email:', data.user.email);
      console.log('Confirmation required:', data.user.email_confirmed_at ? 'No' : 'Yes');
      
      return { 
        success: true, 
        user: data.user,
        requiresConfirmation: !data.user.email_confirmed_at
      };
    } else {
      console.error('❌ Signup failed: No user data returned');
      return { success: false, error: 'No user data returned' };
    }
    
  } catch (error) {
    console.error('❌ Signup test error:', error);
    return { success: false, error: `${error}` };
  }
};

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testLogin = testLoginFlow;
  (window as any).testSignup = testSignupFlow;
  console.log('🔧 Login test functions available:');
  console.log('- window.testLogin(email, password)');
  console.log('- window.testSignup(email, password, username)');
} 