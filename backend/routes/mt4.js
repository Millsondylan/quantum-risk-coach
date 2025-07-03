const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const winston = require('winston');

// Configure logger for MT4 routes
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/mt4.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Store active connections
const activeConnections = new Map();

/**
 * Connect to MT4
 * POST /api/mt4/connect
 */
router.post('/connect', async (req, res) => {
  try {
    const { server, login, password, sandbox = false } = req.body;

    // Validate required fields
    if (!server || !login || !password) {
      return res.status(400).json({
        success: false,
        message: 'Server, login, and password are required'
      });
    }

    const connectionId = `mt4_${login}_${Date.now()}`;
    
    logger.info(`Attempting MT4 connection for login: ${login}, server: ${server}`);

    // Create connection object
    const connection = {
      id: connectionId,
      server,
      login,
      password,
      sandbox,
      status: 'connecting',
      createdAt: new Date().toISOString()
    };

    // Test connection using Python script
    const connectionResult = await testMT4Connection(connection);
    
    if (connectionResult.success) {
      activeConnections.set(connectionId, {
        ...connection,
        status: 'connected',
        accountInfo: connectionResult.accountInfo
      });

      logger.info(`MT4 connection successful for login: ${login}`);

      res.json({
        success: true,
        connectionId,
        message: 'Successfully connected to MT4',
        accountInfo: connectionResult.accountInfo
      });
    } else {
      logger.error(`MT4 connection failed for login: ${login}: ${connectionResult.message}`);
      
      res.status(400).json({
        success: false,
        message: connectionResult.message || 'Failed to connect to MT4'
      });
    }
  } catch (error) {
    logger.error('MT4 connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during MT4 connection'
    });
  }
});

/**
 * Get account information
 * GET /api/mt4/account/:connectionId
 */
router.get('/account/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const connection = activeConnections.get(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    if (connection.status !== 'connected') {
      return res.status(400).json({
        success: false,
        message: 'Connection is not active'
      });
    }

    logger.info(`Fetching MT4 account info for connection: ${connectionId}`);

    const accountInfo = await getMT4AccountInfo(connection);
    
    if (accountInfo.success) {
      // Update connection with fresh account info
      activeConnections.set(connectionId, {
        ...connection,
        accountInfo: accountInfo.data
      });

      res.json({
        success: true,
        accountInfo: accountInfo.data
      });
    } else {
      res.status(400).json({
        success: false,
        message: accountInfo.message
      });
    }
  } catch (error) {
    logger.error('MT4 account info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching account info'
    });
  }
});

/**
 * Get open positions
 * GET /api/mt4/positions/:connectionId
 */
router.get('/positions/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const connection = activeConnections.get(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    if (connection.status !== 'connected') {
      return res.status(400).json({
        success: false,
        message: 'Connection is not active'
      });
    }

    logger.info(`Fetching MT4 positions for connection: ${connectionId}`);

    const positions = await getMT4Positions(connection);
    
    res.json({
      success: true,
      positions: positions.data || []
    });
  } catch (error) {
    logger.error('MT4 positions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching positions'
    });
  }
});

/**
 * Get trade history
 * GET /api/mt4/history/:connectionId
 */
router.get('/history/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { symbol, from, to, limit = 100 } = req.query;
    const connection = activeConnections.get(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    if (connection.status !== 'connected') {
      return res.status(400).json({
        success: false,
        message: 'Connection is not active'
      });
    }

    logger.info(`Fetching MT4 history for connection: ${connectionId}`);

    const history = await getMT4History(connection, { symbol, from, to, limit });
    
    res.json({
      success: true,
      trades: history.data || []
    });
  } catch (error) {
    logger.error('MT4 history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching trade history'
    });
  }
});

/**
 * Disconnect from MT4
 * POST /api/mt4/disconnect/:connectionId
 */
router.post('/disconnect/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const connection = activeConnections.get(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    logger.info(`Disconnecting MT4 connection: ${connectionId}`);

    // Remove from active connections
    activeConnections.delete(connectionId);

    res.json({
      success: true,
      message: 'Successfully disconnected from MT4'
    });
  } catch (error) {
    logger.error('MT4 disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during disconnect'
    });
  }
});

/**
 * Get connection status
 * GET /api/mt4/status/:connectionId
 */
router.get('/status/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const connection = activeConnections.get(connectionId);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Connection not found'
      });
    }

    res.json({
      success: true,
      status: connection.status,
      accountInfo: connection.accountInfo,
      createdAt: connection.createdAt
    });
  } catch (error) {
    logger.error('MT4 status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching status'
    });
  }
});

// Helper function to test MT4 connection using Python script
async function testMT4Connection(connection) {
  return new Promise((resolve) => {
    // Use demo script for testing (works without MetaTrader5)
    const pythonScript = path.join(__dirname, '../scripts/mt4_connect_demo.py');
    
    const pythonProcess = spawn('python3', [
      pythonScript,
      '--server', connection.server,
      '--login', connection.login,
      '--password', connection.password,
      '--sandbox', connection.sandbox.toString()
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve({
            success: true,
            accountInfo: result
          });
        } catch (error) {
          resolve({
            success: false,
            message: 'Invalid response from MT4 script'
          });
        }
      } else {
        resolve({
          success: false,
          message: errorOutput || 'Failed to connect to MT4'
        });
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      pythonProcess.kill();
      resolve({
        success: false,
        message: 'Connection timeout'
      });
    }, 30000);
  });
}

// Helper function to get MT4 account info
async function getMT4AccountInfo(connection) {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, '../scripts/mt4_account.py');
    
    const pythonProcess = spawn('python', [
      pythonScript,
      '--server', connection.server,
      '--login', connection.login,
      '--password', connection.password
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve({
            success: true,
            data: result
          });
        } catch (error) {
          resolve({
            success: false,
            message: 'Invalid response from MT4 script'
          });
        }
      } else {
        resolve({
          success: false,
          message: errorOutput || 'Failed to get account info'
        });
      }
    });
  });
}

// Helper function to get MT4 positions
async function getMT4Positions(connection) {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, '../scripts/mt4_positions.py');
    
    const pythonProcess = spawn('python', [
      pythonScript,
      '--server', connection.server,
      '--login', connection.login,
      '--password', connection.password
    ]);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve({
            success: true,
            data: result
          });
        } catch (error) {
          resolve({
            success: false,
            message: 'Invalid response from MT4 script'
          });
        }
      } else {
        resolve({
          success: false,
          message: errorOutput || 'Failed to get positions'
        });
      }
    });
  });
}

// Helper function to get MT4 trade history
async function getMT4History(connection, params) {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, '../scripts/mt4_history.py');
    
    const args = [
      pythonScript,
      '--server', connection.server,
      '--login', connection.login,
      '--password', connection.password
    ];

    if (params.symbol) args.push('--symbol', params.symbol);
    if (params.from) args.push('--from', params.from);
    if (params.to) args.push('--to', params.to);
    if (params.limit) args.push('--limit', params.limit.toString());

    const pythonProcess = spawn('python', args);

    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve({
            success: true,
            data: result
          });
        } catch (error) {
          resolve({
            success: false,
            message: 'Invalid response from MT4 script'
          });
        }
      } else {
        resolve({
          success: false,
          message: errorOutput || 'Failed to get trade history'
        });
      }
    });
  });
}

module.exports = router; 