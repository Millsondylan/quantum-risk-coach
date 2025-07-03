const express = require('express');
const router = express.Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'quantum-risk-coach-backend',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Detailed health check
 * GET /api/health/detailed
 */
router.get('/detailed', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'quantum-risk-coach-backend',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    platform: process.platform,
    nodeVersion: process.version,
    pid: process.pid,
    features: {
      mt4: true,
      mt5: true,
      python: true
    }
  };

  res.json(health);
});

module.exports = router; 