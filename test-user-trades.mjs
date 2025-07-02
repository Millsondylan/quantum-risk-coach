import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addSampleTrades() {
  console.log('🔧 Adding sample trades for test user...');
  
  const testUserId = 'local_1751461097770_validation';
  
  const sampleTrades = [
    {
      user_id: testUserId,
      instrument: 'EUR/USD',
      entry_price: 1.0823,
      exit_price: 1.0845,
      lot_size: 1.0,
      trade_type: 'buy',
      status: 'closed',
      profit_loss: 220.00,
      opened_at: '2024-01-15T08:00:00Z',
      closed_at: '2024-01-15T10:30:00Z',
      source: 'manual',
      stop_loss: 1.0800,
      take_profit: 1.0900
    },
    {
      user_id: testUserId,
      instrument: 'BTC/USD',
      entry_price: 42300.00,
      exit_price: 43567.89,
      lot_size: 0.1,
      trade_type: 'buy',
      status: 'closed',
      profit_loss: 1267.89,
      opened_at: '2024-01-16T14:00:00Z',
      closed_at: '2024-01-17T09:15:00Z',
      source: 'manual',
      stop_loss: 42000.00,
      take_profit: 45000.00
    },
    {
      user_id: testUserId,
      instrument: 'GBP/USD',
      entry_price: 1.2650,
      exit_price: 1.2634,
      lot_size: 0.5,
      trade_type: 'sell',
      status: 'closed',
      profit_loss: 80.00,
      opened_at: '2024-01-18T12:00:00Z',
      closed_at: '2024-01-18T16:45:00Z',
      source: 'manual',
      stop_loss: 1.2700,
      take_profit: 1.2600
    },
    {
      user_id: testUserId,
      instrument: 'EUR/USD',
      entry_price: 1.0845,
      lot_size: 1.0,
      trade_type: 'buy',
      status: 'open',
      profit_loss: 0.00,
      opened_at: '2024-01-19T08:30:00Z',
      source: 'manual',
      stop_loss: 1.0820,
      take_profit: 1.0880
    },
    {
      user_id: testUserId,
      instrument: 'XAU/USD',
      entry_price: 2020.00,
      lot_size: 0.1,
      trade_type: 'buy',
      status: 'open',
      profit_loss: 0.00,
      opened_at: '2024-01-19T10:00:00Z',
      source: 'manual',
      stop_loss: 2010.00,
      take_profit: 2040.00
    }
  ];
  
  try {
    const { data, error } = await supabase
      .from('trades')
      .insert(sampleTrades)
      .select();
    
    if (error) {
      console.error('Error adding sample trades:', error);
    } else {
      console.log('✅ Added sample trades:', data?.length || 0);
      console.log('Sample trades added successfully!');
    }
  } catch (err) {
    console.error('Failed to add sample trades:', err);
  }
}

// Run the function
addSampleTrades().catch(console.error); 