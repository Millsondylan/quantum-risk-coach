import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session
    const storedUser = localStorage.getItem('quantum_risk_coach_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('quantum_risk_coach_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Get registered users from localStorage
      const storedUsers = localStorage.getItem('quantum_risk_coach_all_users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Find user by email
      const user = allUsers.find((u: any) => u.email === email);
      if (!user) {
        throw new Error('User not found. Please sign up first.');
      }
      
      // Check password
      const storedPassword = localStorage.getItem(`quantum_risk_coach_password_${user.id}`);
      if (storedPassword !== password) {
        throw new Error('Invalid password');
      }
      
      // Sign in successful
      const authUser: User = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      
      setUser(authUser);
      localStorage.setItem('quantum_risk_coach_user', JSON.stringify(authUser));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      // Check if user already exists
      const storedUsers = localStorage.getItem('quantum_risk_coach_all_users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      const existingUser = allUsers.find((u: any) => u.email === email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        username,
        created_at: new Date().toISOString(),
        subscription_status: 'unlimited',
        posts_remaining: 999999
      };
      
      // Save user to registry
      allUsers.push(newUser);
      localStorage.setItem('quantum_risk_coach_all_users', JSON.stringify(allUsers));
      
      // Save password separately (in production, this would be hashed)
      localStorage.setItem(`quantum_risk_coach_password_${newUser.id}`, password);
      
      // Sign in the new user
      const authUser: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      };
      
      setUser(authUser);
      localStorage.setItem('quantum_risk_coach_user', JSON.stringify(authUser));
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      localStorage.removeItem('quantum_risk_coach_user');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    signIn,
    signUp,
    signOut,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 