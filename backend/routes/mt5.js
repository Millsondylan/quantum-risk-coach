const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');
const path = require('path');
const winston = require('winston');

// Configure logger for MT5 routes
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/mt5.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Store active connections
const activeConnections = new Map();

/**
 * Connect to MT5
 * POST /api/mt5/connect
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

    const connectionId = `mt5_${login}_${Date.now()}`;
    
    logger.info(`Attempting MT5 connection for login: ${login}, server: ${server}`);

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
    const connectionResult = await testMT5Connection(connection);
    
    if (connectionResult.success) {
      activeConnections.set(connectionId, {
        ...connection,
        status: 'connected',
        accountInfo: connectionResult.accountInfo
      });

      logger.info(`MT5 connection successful for login: ${login}`);

      res.json({
        success: true,
        connectionId,
        message: 'Successfully connected to MT5',
        accountInfo: connectionResult.accountInfo
      });
    } else {
      logger.error(`MT5 connection failed for login: ${login}: ${connectionResult.message}`);
      
      res.status(400).json({
        success: false,
        message: connectionResult.message || 'Failed to connect to MT5'
      });
    }
  } catch (error) {
    logger.error('MT5 connect error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during MT5 connection'
    });
  }
});

/**
 * Get account information
 * GET /api/mt5/account/:connectionId
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

    logger.info(`Fetching MT5 account info for connection: ${connectionId}`);

    const accountInfo = await getMT5AccountInfo(connection);
    
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
    logger.error('MT5 account info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching account info'
    });
  }
});

/**
 * Get open positions
 * GET /api/mt5/positions/:connectionId
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

    logger.info(`Fetching MT5 positions for connection: ${connectionId}`);

    const positions = await getMT5Positions(connection);
    
    res.json({
      success: true,
      positions: positions.data || []
    });
  } catch (error) {
    logger.error('MT5 positions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching positions'
    });
  }
});

/**
 * Get trade history
 * GET /api/mt5/history/:connectionId
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

    logger.info(`Fetching MT5 history for connection: ${connectionId}`);

    const history = await getMT5History(connection, { symbol, from, to, limit });
    
    res.json({
      success: true,
      trades: history.data || []
    });
  } catch (error) {
    logger.error('MT5 history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching trade history'
    });
  }
});

/**
 * Disconnect from MT5
 * POST /api/mt5/disconnect/:connectionId
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

    logger.info(`Disconnecting MT5 connection: ${connectionId}`);

    // Remove from active connections
    activeConnections.delete(connectionId);

    res.json({
      success: true,
      message: 'Successfully disconnected from MT5'
    });
  } catch (error) {
    logger.error('MT5 disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during disconnect'
    });
  }
});

/**
 * Get connection status
 * GET /api/mt5/status/:connectionId
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
    logger.error('MT5 status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error fetching status'
    });
  }
});

// Helper function to test MT5 connection using Python script
async function testMT5Connection(connection) {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, '../scripts/mt5_connect.py');
    
    const pythonProcess = spawn('python', [
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
            message: 'Invalid response from MT5 script'
          });
        }
      } else {
        resolve({
          success: false,
          message: errorOutput || 'Failed to connect to MT5'
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

// Helper function to get MT5 account info
async function getMT5AccountInfo(connection) {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, '../scripts/mt5_account.py');
    
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
            message: 'Invalid response from MT5 script'
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

// Helper function to get MT5 positions
async function getMT5Positions(connection) {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, '../scripts/mt5_positions.py');
    
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
            message: 'Invalid response from MT5 script'
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

// Helper function to get MT5 trade history
async function getMT5History(connection, params) {
  return new Promise((resolve) => {
    const pythonScript = path.join(__dirname, '../scripts/mt5_history.py');
    
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
            message: 'Invalid response from MT5 script'
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