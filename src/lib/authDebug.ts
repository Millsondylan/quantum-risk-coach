// Authentication Debugging Utility
// Use this to debug "failed to load" auth issues

import { supabase } from '@/integrations/supabase/client';

export const authDebug = {
  async runFullDiagnostic() {
    console.log('🔍 Starting Authentication Diagnostic...\n');
    
    const results = {
      connection: false,
      tables: false,
      policies: false,
      trigger: false,
      signup: false,
      signin: false
    };

    try {
      // Test 1: Basic Connection
      console.log('1️⃣ Testing Supabase connection...');
      const { data: connectionTest } = await supabase.from('profiles').select('count', { count: 'exact' }).limit(1);
      if (connectionTest !== null) {
        console.log('✅ Connection successful');
        results.connection = true;
      } else {
        console.log('❌ Connection failed');
        return results;
      }

      // Test 2: Check Tables
      console.log('\n2️⃣ Checking database tables...');
      try {
        const { data: profilesCheck } = await supabase.from('profiles').select('*').limit(1);
        console.log('✅ Profiles table accessible');
        results.tables = true;
      } catch (error) {
        console.log('❌ Profiles table issue:', error);
      }

      // Test 3: Test Auth Methods
      console.log('\n3️⃣ Testing auth methods...');
      if (typeof supabase.auth.signUp === 'function' && typeof supabase.auth.signInWithPassword === 'function') {
        console.log('✅ Auth methods available');
      } else {
        console.log('❌ Auth methods missing');
      }

      // Test 4: Current Session
      console.log('\n4️⃣ Checking current session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.log('❌ Session check failed:', sessionError.message);
      } else {
        console.log('✅ Session check successful');
        if (session) {
          console.log('📱 Current user:', session.user.email);
        } else {
          console.log('📱 No active session');
        }
      }

      // Test 5: Test Signup (with fake email)
      console.log('\n5️⃣ Testing signup flow...');
      try {
        const testEmail = `test-${Date.now()}@example.com`;
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: testEmail,
          password: 'testpassword123',
          options: {
            data: {
              username: 'testuser'
            }
          }
        });

        if (signupError) {
          console.log('❌ Signup test failed:', signupError.message);
          if (signupError.message.includes('User already registered')) {
            console.log('✅ Signup flow working (user exists)');
            results.signup = true;
          }
        } else {
          console.log('✅ Signup test successful');
          results.signup = true;
          
          // Clean up test user if created
          if (signupData.user) {
            await supabase.auth.admin.deleteUser(signupData.user.id);
          }
        }
      } catch (error) {
        console.log('❌ Signup test error:', error);
      }

      // Test 6: Check Environment
      console.log('\n6️⃣ Checking environment...');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseKey) {
        console.log('✅ Environment variables present');
        console.log('🔗 URL:', supabaseUrl.substring(0, 30) + '...');
        console.log('🔑 Key:', supabaseKey.substring(0, 20) + '...');
      } else {
        console.log('❌ Missing environment variables');
      }

      console.log('\n📊 Diagnostic Results:', results);
      return results;

    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      return results;
    }
  },

  async testSpecificSignup(email: string, password: string, username: string) {
    console.log(`🧪 Testing signup for: ${email}`);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          }
        }
      });

      if (error) {
        console.error('❌ Signup failed:', error.message);
        console.log('🔍 Error details:', error);
        return { success: false, error };
      }

      console.log('✅ Signup successful:', data);
      
      // Check if profile was created
      if (data.user) {
        setTimeout(async () => {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user!.id)
            .single();
            
          if (profileError) {
            console.log('⚠️ Profile creation failed:', profileError);
          } else {
            console.log('✅ Profile created:', profileData);
          }
        }, 2000);
      }

      return { success: true, data };
    } catch (error) {
      console.error('❌ Signup error:', error);
      return { success: false, error };
    }
  },

  async testSpecificSignin(email: string, password: string) {
    console.log(`🧪 Testing signin for: ${email}`);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Signin failed:', error.message);
        console.log('🔍 Error details:', error);
        return { success: false, error };
      }

      console.log('✅ Signin successful:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Signin error:', error);
      return { success: false, error };
    }
  },

  async checkCurrentUser() {
    console.log('👤 Checking current user status...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log('❌ User check failed:', error);
      return null;
    }
    
    if (user) {
      console.log('✅ User logged in:', user.email);
      
      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.log('⚠️ Profile not found:', profileError);
      } else {
        console.log('✅ Profile found:', profile);
      }
      
      return { user, profile };
    } else {
      console.log('📱 No user logged in');
      return null;
    }
  }
};

// Make available globally for browser console
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebug;
  (window as any).runAuthDiagnostic = authDebug.runFullDiagnostic;
  (window as any).testSignup = authDebug.testSpecificSignup;
  (window as any).testSignin = authDebug.testSpecificSignin;
  (window as any).checkCurrentUser = authDebug.checkCurrentUser;
} 