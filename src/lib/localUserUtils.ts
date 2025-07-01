// Local User Management Utilities
// Access these functions in browser console for debugging

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

  // Create a new demo user
  createDemoUser(username: string, email: string, password: string = 'demo123'): boolean {
    try {
      const userId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newUser: LocalUser = {
        id: userId,
        email,
        username,
        created_at: new Date().toISOString(),
        subscription_status: 'unlimited',
        posts_remaining: 999999
      };

      // Add to user registry
      const users = this.getAllUsers();
      const existingIndex = users.findIndex(u => u.email === email);
      
      if (existingIndex >= 0) {
        console.warn('User already exists:', email);
        return false;
      }

      users.push(newUser);
      localStorage.setItem('quantum_risk_coach_all_users', JSON.stringify(users));
      localStorage.setItem(`quantum_risk_coach_password_${userId}`, password);
      
      console.log('✅ Demo user created:', { username, email, password });
      return true;
    } catch (error) {
      console.error('Failed to create demo user:', error);
      return false;
    }
  },

  // Delete a user by email
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

  // Clear all local data
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

  // Get password for debugging (use carefully)
  getPassword(email: string): string | null {
    const users = this.getAllUsers();
    const user = users.find(u => u.email === email);
    if (user) {
      return localStorage.getItem(`quantum_risk_coach_password_${user.id}`);
    }
    return null;
  },

  // Quick setup for testing
  setupDemoData(): void {
    console.log('🚀 Setting up demo data...');
    
    const demoUsers = [
      { username: 'Demo Trader', email: 'demo@trader.com', password: 'demo123' },
      { username: 'Test Investor', email: 'test@investor.com', password: 'test123' },
      { username: 'Alpha Trader', email: 'alpha@trading.com', password: 'alpha123' },
      { username: 'Pro Investor', email: 'pro@investor.com', password: 'pro123' },
    ];

    let created = 0;
    demoUsers.forEach(demo => {
      if (this.createDemoUser(demo.username, demo.email, demo.password)) {
        created++;
      }
    });

    console.log(`✅ Created ${created} demo accounts`);
    console.log('📖 Available accounts:');
    console.table(demoUsers);
  },

  // Help function
  help(): void {
    console.log(`
🔧 Local User Management Console Commands:

📊 Information:
• localUserUtils.showUserInfo()          - Show current user and all users
• localUserUtils.getCurrentUser()        - Get current logged-in user
• localUserUtils.getAllUsers()           - Get all registered users

👤 User Management:
• localUserUtils.createDemoUser(username, email, password)  - Create new demo user
• localUserUtils.deleteUser(email)       - Delete user by email
• localUserUtils.getPassword(email)      - Get password for debugging

🔄 Setup & Reset:
• localUserUtils.setupDemoData()         - Create default demo accounts
• localUserUtils.clearAllData()          - Clear all local data (reset app)

Example usage:
localUserUtils.createDemoUser("New Trader", "new@trader.com", "pass123")
localUserUtils.showUserInfo("demo@trader.com")
localUserUtils.deleteUser("old@trader.com")

Type localUserUtils.help() to see this again.
    `);
  }
};

// Make available globally for console access
if (typeof window !== 'undefined') {
  (window as any).localUserUtils = localUserUtils;
  console.log('🔧 Local User Utils loaded! Type "localUserUtils.help()" for commands.');
} 