# MT4/MT5 Integration for Quantum Risk Coach

This document explains how to set up and use the MT4/MT5 integration in Gitpod for real trading connections.

## 🚀 Quick Start

### 1. Start All Services
```bash
./start-mt4mt5.sh
```

This script will:
- Install all required dependencies
- Start Xvfb for MetaTrader5
- Initialize the MT4/MT5 API service
- Start the main backend server
- Start the frontend application
- Monitor all services

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MT4/MT5 API**: http://localhost:3002
- **API Documentation**: http://localhost:3002/docs

## 📋 Prerequisites

### Gitpod Environment
The Gitpod environment is automatically configured with:
- Python 3.x with MetaTrader5 package
- Node.js and npm
- Xvfb for headless MetaTrader5 operation
- All required system dependencies

### MetaTrader5 Installation
The MetaTrader5 Python package is automatically installed in the Gitpod environment. This package provides:
- Connection to MT4/MT5 terminals
- Account information retrieval
- Position and trade history access
- Real-time data streaming

## 🔧 Architecture

### Services Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │  MT4/MT5 API    │
│   (Port 3000)   │◄──►│   (Port 3001)   │◄──►│   (Port 3002)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  MetaTrader5    │
                                              │   Python API    │
                                              └─────────────────┘
```

### Key Components

#### 1. MT4/MT5 Service (`backend/scripts/mt4mt5_service.py`)
- Core service for MetaTrader5 operations
- Handles account connections
- Manages positions and trade history
- Thread-safe connection management

#### 2. FastAPI Service (`backend/mt4mt5_api.py`)
- REST API endpoints for MT4/MT5 operations
- CORS enabled for frontend integration
- Automatic API documentation
- Health monitoring

#### 3. Frontend Integration (`src/lib/api.ts`)
- TypeScript interfaces for MT4/MT5 data
- Service functions for API communication
- Error handling and retry logic
- Backward compatibility with existing MT4 service

## 🔌 API Endpoints

### Connection Management
- `POST /connect` - Connect to MT4/MT5 account
- `POST /disconnect/{connection_id}` - Disconnect from account
- `GET /connections` - Get all active connections

### Account Information
- `GET /account/{connection_id}` - Get account details
- `GET /positions/{connection_id}` - Get open positions
- `POST /history/{connection_id}` - Get trade history

### System
- `GET /health` - Service health check
- `GET /test` - Test endpoint

## 📝 Usage Examples

### 1. Connect to MT4/MT5 Account
```javascript
import { mt4mt5Service } from '@/lib/api';

const result = await mt4mt5Service.connectToMT4MT5({
  server: 'your-broker-server.com',
  login: 12345678,
  password: 'your-password',
  platform: 'MT5'
});

if (result.success) {
  console.log('Connected!', result.connectionId);
  console.log('Account:', result.account);
}
```

### 2. Get Account Information
```javascript
const accountInfo = await mt4mt5Service.getAccountInfo(connectionId);
if (accountInfo.success) {
  console.log('Balance:', accountInfo.account.balance);
  console.log('Equity:', accountInfo.account.equity);
}
```

### 3. Get Open Positions
```javascript
const positions = await mt4mt5Service.getPositions(connectionId);
if (positions.success) {
  positions.positions.forEach(pos => {
    console.log(`${pos.symbol}: ${pos.type} ${pos.volume} @ ${pos.price}`);
  });
}
```

### 4. Get Trade History
```javascript
const history = await mt4mt5Service.getHistory(connectionId, {
  symbol: 'EURUSD',
  fromDate: '2024-01-01',
  toDate: '2024-01-31',
  limit: 100
});

if (history.success) {
  console.log(`Found ${history.trades.length} trades`);
}
```

## 🔒 Security Considerations

### Credential Management
- Credentials are stored in memory only during active connections
- No persistent storage of passwords
- Automatic cleanup on disconnect
- Secure transmission over HTTPS (in production)

### Connection Security
- All connections use encrypted protocols
- Automatic reconnection handling
- Connection timeout management
- Error logging without sensitive data

## 🐛 Troubleshooting

### Common Issues

#### 1. MetaTrader5 Import Error
```bash
# Check if MetaTrader5 is installed
python3 -c "import MetaTrader5; print('OK')"

# Reinstall if needed
pip3 install --force-reinstall MetaTrader5
```

#### 2. Xvfb Not Running
```bash
# Start Xvfb manually
Xvfb :99 -screen 0 1024x768x24 &
export DISPLAY=:99
```

#### 3. Port Already in Use
```bash
# Check what's using the port
lsof -i :3002

# Kill the process
kill -9 <PID>
```

#### 4. Connection Failed
- Verify broker server address
- Check login credentials
- Ensure MT4/MT5 terminal is running
- Check network connectivity

### Debug Mode
Enable debug logging by setting environment variables:
```bash
export PYTHONPATH=/workspaces/quantum-risk-coach/backend/scripts:$PYTHONPATH
export DISPLAY=:99
cd backend
python3 -u mt4mt5_api.py
```

## 📊 Monitoring

### Health Checks
- Service health: `curl http://localhost:3002/health`
- Backend health: `curl http://localhost:3001/health`
- Frontend: `curl http://localhost:3000`

### Logs
- MT4/MT5 API logs: `backend/logs/mt4mt5_api.log`
- Service logs: `backend/logs/mt4mt5_service.log`
- Backend logs: `backend/logs/combined.log`

## 🔄 Development

### Adding New Features
1. Extend the `MT4MT5Service` class in `mt4mt5_service.py`
2. Add corresponding API endpoints in `mt4mt5_api.py`
3. Update TypeScript interfaces in `api.ts`
4. Test with real MT4/MT5 connection

### Testing
```bash
# Test MT4/MT5 service directly
cd backend
python3 scripts/mt4mt5_service.py

# Test API endpoints
curl -X POST http://localhost:3002/connect \
  -H "Content-Type: application/json" \
  -d '{"server":"demo","login":123456,"password":"demo","platform":"MT5"}'
```

## 📚 Additional Resources

- [MetaTrader5 Python Documentation](https://www.mql5.com/en/docs/python_metatrader5)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Gitpod Documentation](https://www.gitpod.io/docs)

## 🤝 Support

For issues with the MT4/MT5 integration:
1. Check the troubleshooting section above
2. Review the logs in `backend/logs/`
3. Test the connection manually
4. Verify broker credentials and server settings

---

**Note**: This integration requires a valid MT4/MT5 account with a broker that supports the MetaTrader5 Python API. Demo accounts are recommended for testing. 