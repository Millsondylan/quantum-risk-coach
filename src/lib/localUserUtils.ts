// Production User Management Utilities
// Real user operations only - no demo or fake data

import { Preferences } from '@capacitor/preferences';

interface LocalUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
  subscription_status: string;
  posts_remaining: number;
}

export const localUserUtils = {
  // Get current logged-in user
  getCurrentUser(): LocalUser | null {
    try {
      const stored = localStorage.getItem('quantum_risk_coach_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  // Get all registered users
  getAllUsers(): LocalUser[] {
    try {
      const stored = localStorage.getItem('quantum_risk_coach_all_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  // Delete a user by email (production use only)
  deleteUser(email: string): boolean {
    try {
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.email === email);
      
      if (userIndex === -1) {
        console.warn('User not found:', email);
        return false;
      }

      const user = users[userIndex];
      
      // Remove from registry
      users.splice(userIndex, 1);
      localStorage.setItem('quantum_risk_coach_all_users', JSON.stringify(users));
      
      // Remove password
      localStorage.removeItem(`quantum_risk_coach_password_${user.id}`);
      
      // If this is the current user, log them out
      const currentUser = this.getCurrentUser();
      if (currentUser && currentUser.email === email) {
        localStorage.removeItem('quantum_risk_coach_user');
      }
      
      console.log('✅ User deleted:', email);
      return true;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return false;
    }
  },

  // Clear all local data (emergency use only)
  clearAllData(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith('quantum_risk_coach')
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      
      console.log('✅ All local data cleared');
      console.log('🔄 Reload the page to start fresh');
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  },

  // Show user info in a nice format
  showUserInfo(email?: string): void {
    if (email) {
      const users = this.getAllUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        console.table(user);
      } else {
        console.warn('User not found:', email);
      }
    } else {
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        console.log('📱 Current User:');
        console.table(currentUser);
      } else {
        console.log('👤 No user currently logged in');
      }
      
      const allUsers = this.getAllUsers();
      if (allUsers.length > 0) {
        console.log('👥 All Registered Users:');
        console.table(allUsers);
      }
    }
  },

  // Production user validation
  validateUserSession(): boolean {
    const user = this.getCurrentUser();
    return user !== null && user.id && user.email;
  },

  // Get user preferences
  getUserPreferences(): any {
    try {
      const user = this.getCurrentUser();
      if (!user) return {};
      
      const stored = localStorage.getItem(`quantum_risk_coach_prefs_${user.id}`);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  // Save user preferences
  saveUserPreferences(preferences: any): boolean {
    try {
      const user = this.getCurrentUser();
      if (!user) return false;
      
      localStorage.setItem(`quantum_risk_coach_prefs_${user.id}`, JSON.stringify(preferences));
      return true;
    } catch {
      return false;
    }
  },

  // Help function
  help(): void {
    console.log(`
🔧 Production User Management Console Commands:

📊 Information:
• localUserUtils.showUserInfo()          - Show current user and all users
• localUserUtils.getCurrentUser()        - Get current logged-in user
• localUserUtils.validateUserSession()   - Check if user session is valid

👤 User Management:
• localUserUtils.deleteUser(email)       - Delete user by email
• localUserUtils.getUserPreferences()    - Get user preferences
• localUserUtils.saveUserPreferences()   - Save user preferences

🔄 Emergency:
• localUserUtils.clearAllData()          - Clear all local data (DANGER!)

Note: Demo functionality removed for production security.
Type localUserUtils.help() to see this again.
    `);
  }
};

// Make available globally for console access
if (typeof window !== 'undefined') {
  (window as any).localUserUtils = localUserUtils;
  console.log('🔧 Production User Utils loaded! Type "localUserUtils.help()" for commands.');
}

export const saveUserData = async (key: string, value: any) => {
  await Preferences.set({ key, value: JSON.stringify(value) });
};

export const getUserData = async (key: string) => {
  const { value } = await Preferences.get({ key });
  return value ? JSON.parse(value) : null;
};

export const removeUserData = async (key: string) => {
  await Preferences.remove({ key });
};

export const clearAllUserData = async () => {
  await Preferences.clear();
}; 