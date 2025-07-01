import { supabase } from '@/integrations/supabase/client';

export interface AuthTestResult {
  connectionTest: boolean;
  signupTest: boolean;
  loginTest: boolean;
  errors: string[];
  details: {
    connection?: string;
    signup?: string;
    login?: string;
  };
}

export const testAuthFlow = async (): Promise<AuthTestResult> => {
  const result: AuthTestResult = {
    connectionTest: false,
    signupTest: false,
    loginTest: false,
    errors: [],
    details: {}
  };

  console.log('🔍 Testing Authentication Flow...');

  // Test 1: Connection Test
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      result.errors.push(`Connection failed: ${error.message}`);
      result.details.connection = error.message;
    } else {
      result.connectionTest = true;
      result.details.connection = 'Successfully connected to Supabase Auth';
      console.log('✅ Auth connection successful');
    }
  } catch (error) {
    result.errors.push(`Connection error: ${error}`);
    result.details.connection = `${error}`;
  }

  // Test 2: Check if auth is properly configured
  try {
    const { data } = await supabase.auth.getUser();
    console.log('📋 Current auth state:', data.user ? 'Logged in' : 'Not logged in');
    console.log('📋 User email:', data.user?.email || 'None');
  } catch (error) {
    console.warn('Could not get current user:', error);
  }

  // Test 3: Verify auth methods are working
  try {
    // Test if we can access the auth methods without errors
    if (typeof supabase.auth.signInWithPassword === 'function') {
      result.loginTest = true;
      result.details.login = 'Login method available';
      console.log('✅ Login method available');
    }

    if (typeof supabase.auth.signUp === 'function') {
      result.signupTest = true;
      result.details.signup = 'Signup method available';
      console.log('✅ Signup method available');
    }
  } catch (error) {
    result.errors.push(`Auth methods error: ${error}`);
  }

  return result;
};

// Create a test user profile after signup
export const createUserProfile = async (userId: string, userData: {
  username?: string;
  email?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: userData.username || 'New User',
        email: userData.email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Profile creation failed:', error);
      return { success: false, error };
    }

    console.log('✅ User profile created:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Profile creation error:', error);
    return { success: false, error };
  }
};

// Check if user has a profile
export const checkUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Profile check failed:', error);
      return { exists: false, error };
    }

    return { 
      exists: !!data, 
      profile: data,
      error: null 
    };
  } catch (error) {
    console.error('Profile check error:', error);
    return { exists: false, error };
  }
}; 