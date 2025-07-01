import { supabase } from '@/integrations/supabase/client';

export interface DatabaseHealthCheck {
  connected: boolean;
  tablesExist: {
    trades: boolean;
    profiles: boolean;
    payments: boolean;
    marketplace_subscriptions: boolean;
  };
  errors: string[];
}

export const checkDatabaseHealth = async (): Promise<DatabaseHealthCheck> => {
  const result: DatabaseHealthCheck = {
    connected: false,
    tablesExist: {
      trades: false,
      profiles: false,
      payments: false,
      marketplace_subscriptions: false,
    },
    errors: []
  };

  try {
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact' })
      .limit(1);

    if (connectionError) {
      result.errors.push(`Connection failed: ${connectionError.message}`);
      return result;
    }

    result.connected = true;

    // Check each table exists by attempting to query it
    const tables = ['trades', 'profiles', 'payments', 'marketplace_subscriptions'] as const;
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (!error) {
          result.tablesExist[table] = true;
        } else {
          result.errors.push(`Table ${table} error: ${error.message}`);
        }
      } catch (err) {
        result.errors.push(`Table ${table} check failed: ${err}`);
      }
    }

  } catch (error) {
    result.errors.push(`Database health check failed: ${error}`);
  }

  return result;
};

export const setupTradingTables = async () => {
  // Note: In production, these would be handled by Supabase migrations
  // This is just for verification that the tables exist
  
  console.log('🔍 Checking database setup...');
  const health = await checkDatabaseHealth();
  
  if (!health.connected) {
    console.error('❌ Database connection failed');
    console.error('Errors:', health.errors);
    return false;
  }

  console.log('✅ Database connected successfully');
  
  const missingTables = Object.entries(health.tablesExist)
    .filter(([, exists]) => !exists)
    .map(([table]) => table);

  if (missingTables.length > 0) {
    console.warn('⚠️ Missing tables:', missingTables);
    console.log('Please ensure these tables exist in your Supabase database');
    return false;
  }

  console.log('✅ All required tables exist');
  return true;
};

// Test data creation for development
export const createTestTradeData = async (userId: string) => {
  const testTrades = [
    {
      user_id: userId,
      instrument: 'EURUSD',
      trade_type: 'buy',
      entry_price: 1.0850,
      exit_price: 1.0920,
      lot_size: 0.1,
      profit_loss: 70.00,
      status: 'closed',
      opened_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      closed_at: new Date(Date.now() - 82800000).toISOString(), // 1 hour later
      source: 'manual'
    },
    {
      user_id: userId,
      instrument: 'GBPUSD',
      trade_type: 'sell',
      entry_price: 1.2650,
      exit_price: 1.2580,
      lot_size: 0.2,
      profit_loss: 140.00,
      status: 'closed',
      opened_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      closed_at: new Date(Date.now() - 169200000).toISOString(), // 1 hour later
      source: 'manual'
    },
    {
      user_id: userId,
      instrument: 'USDJPY',
      trade_type: 'buy',
      entry_price: 150.25,
      lot_size: 0.1,
      status: 'open',
      opened_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      source: 'manual'
    }
  ];

  try {
    const { data, error } = await supabase
      .from('trades')
      .insert(testTrades)
      .select();

    if (error) {
      console.error('Failed to create test trades:', error);
      return false;
    }

    console.log('✅ Test trade data created:', data);
    return true;
  } catch (error) {
    console.error('Error creating test data:', error);
    return false;
  }
}; 