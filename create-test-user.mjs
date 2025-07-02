// Create a test user in local storage for validation
console.log('🔧 Creating test user for validation...');

// Simulate local storage setup
const localStorage = {
  data: {},
  setItem(key, value) { this.data[key] = value; },
  getItem(key) { return this.data[key] || null; },
  removeItem(key) { delete this.data[key]; }
};

// Create test user
const testUser = {
  id: `local_${Date.now()}_validation`,
  email: 'test@validation.com',
  username: 'ValidationUser',
  created_at: new Date().toISOString(),
  subscription_status: 'unlimited',
  posts_remaining: 999999
};

console.log('Created test user:', testUser);

// Save to a file that we can inject
const fs = await import('fs');
fs.writeFileSync('test-user-inject.js', `
// Inject test user into localStorage
localStorage.setItem('quantum_risk_coach_user', '${JSON.stringify(testUser)}');
localStorage.setItem('quantum_risk_coach_all_users', '[${JSON.stringify(testUser)}]');
localStorage.setItem('quantum_risk_coach_password_${testUser.id}', 'test123');
console.log('✅ Test user injected into localStorage');
`);

console.log('✅ Test user setup file created: test-user-inject.js');
