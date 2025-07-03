#!/usr/bin/env node

/**
 * Test script for MT4/MT5 Integration
 * This script tests the MT4/MT5 API service endpoints
 */

const http = require('http');

const API_BASE = 'http://localhost:3002';

// Test configuration
const testConfig = {
  server: 'demo',
  login: 123456,
  password: 'demo',
  platform: 'MT5'
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  try {
    const response = await makeRequest('GET', '/health');
    if (response.status === 200) {
      console.log('✅ Health check passed');
      console.log('   Status:', response.data.status);
      console.log('   MT5 Initialized:', response.data.mt5_initialized);
    } else {
      console.log('❌ Health check failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
  }
}

async function testConnection() {
  console.log('\n🔌 Testing MT4/MT5 connection...');
  try {
    const response = await makeRequest('POST', '/connect', testConfig);
    if (response.status === 200 && response.data.success) {
      console.log('✅ Connection successful');
      console.log('   Connection ID:', response.data.connection_id);
      console.log('   Account:', response.data.account.login);
      console.log('   Balance:', response.data.account.balance);
      return response.data.connection_id;
    } else {
      console.log('❌ Connection failed:', response.data.detail || response.data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return null;
  }
}

async function testAccountInfo(connectionId) {
  if (!connectionId) return;
  
  console.log('\n📊 Testing account info...');
  try {
    const response = await makeRequest('GET', `/account/${connectionId}`);
    if (response.status === 200 && response.data.success) {
      console.log('✅ Account info retrieved');
      console.log('   Balance:', response.data.account.balance);
      console.log('   Equity:', response.data.account.equity);
      console.log('   Currency:', response.data.account.currency);
    } else {
      console.log('❌ Account info failed:', response.data.detail || response.data.message);
    }
  } catch (error) {
    console.log('❌ Account info error:', error.message);
  }
}

async function testPositions(connectionId) {
  if (!connectionId) return;
  
  console.log('\n📈 Testing positions...');
  try {
    const response = await makeRequest('GET', `/positions/${connectionId}`);
    if (response.status === 200 && response.data.success) {
      console.log('✅ Positions retrieved');
      console.log('   Count:', response.data.positions.length);
      response.data.positions.forEach((pos, index) => {
        console.log(`   Position ${index + 1}: ${pos.symbol} ${pos.type} ${pos.volume}`);
      });
    } else {
      console.log('❌ Positions failed:', response.data.detail || response.data.message);
    }
  } catch (error) {
    console.log('❌ Positions error:', error.message);
  }
}

async function testHistory(connectionId) {
  if (!connectionId) return;
  
  console.log('\n📜 Testing trade history...');
  try {
    const response = await makeRequest('POST', `/history/${connectionId}`, {
      limit: 10
    });
    if (response.status === 200 && response.data.success) {
      console.log('✅ Trade history retrieved');
      console.log('   Count:', response.data.trades.length);
      console.log('   Date range:', response.data.from, 'to', response.data.to);
    } else {
      console.log('❌ Trade history failed:', response.data.detail || response.data.message);
    }
  } catch (error) {
    console.log('❌ Trade history error:', error.message);
  }
}

async function testDisconnect(connectionId) {
  if (!connectionId) return;
  
  console.log('\n🔌 Testing disconnect...');
  try {
    const response = await makeRequest('POST', `/disconnect/${connectionId}`);
    if (response.status === 200 && response.data.success) {
      console.log('✅ Disconnect successful');
    } else {
      console.log('❌ Disconnect failed:', response.data.detail || response.data.message);
    }
  } catch (error) {
    console.log('❌ Disconnect error:', error.message);
  }
}

async function testConnections() {
  console.log('\n🔗 Testing connections list...');
  try {
    const response = await makeRequest('GET', '/connections');
    if (response.status === 200 && response.data.success) {
      console.log('✅ Connections list retrieved');
      console.log('   Active connections:', Object.keys(response.data.connections).length);
    } else {
      console.log('❌ Connections list failed:', response.data.detail || response.data.message);
    }
  } catch (error) {
    console.log('❌ Connections list error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🧪 Starting MT4/MT5 Integration Tests');
  console.log('=====================================');
  
  // Test health check first
  await testHealthCheck();
  
  // Test connection
  const connectionId = await testConnection();
  
  // Test other endpoints if connection successful
  if (connectionId) {
    await testAccountInfo(connectionId);
    await testPositions(connectionId);
    await testHistory(connectionId);
    await testDisconnect(connectionId);
  }
  
  // Test connections list
  await testConnections();
  
  console.log('\n🏁 Tests completed!');
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testConnection,
  testAccountInfo,
  testPositions,
  testHistory,
  testDisconnect,
  testConnections,
  runTests
}; 