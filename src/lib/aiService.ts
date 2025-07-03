import axios from 'axios';

export interface TradingData {
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalTrades: number;
  averageWin?: number;
  averageLoss?: number;
  largestWin?: number;
  largestLoss?: number;
}

export interface CoachingInsight {
  id: string;
  type: 'strength' | 'improvement' | 'warning' | 'tip';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
}

export interface TradingGoal {
  metric: string;
  current: number;
  target: number;
  timeframe: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  message: string;
  response: string;
  timestamp: string;
}

class AIService {
  private baseUrl = '/api/ai';

  async generateInsights(tradingData: TradingData): Promise<CoachingInsight[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/insights`, {
        tradingData
      });
      
      if (response.data.success) {
        return response.data.insights;
      } else {
        throw new Error('Failed to generate insights');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      throw error;
    }
  }

  async chat(message: string, tradingData: TradingData): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/chat`, {
        message,
        tradingData
      });
      
      if (response.data.success) {
        return response.data.response;
      } else {
        throw new Error('Failed to get chat response');
      }
    } catch (error) {
      console.error('Error in AI chat:', error);
      throw error;
    }
  }

  async generateGoals(tradingData: TradingData): Promise<TradingGoal[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/goals`, {
        tradingData
      });
      
      if (response.data.success) {
        return response.data.goals;
      } else {
        throw new Error('Failed to generate goals');
      }
    } catch (error) {
      console.error('Error generating goals:', error);
      throw error;
    }
  }

  async getStatus(): Promise<{ status: string; features: string[] }> {
    try {
      const response = await axios.get(`${this.baseUrl}/status`);
      
      if (response.data.success) {
        return {
          status: response.data.status,
          features: response.data.features
        };
      } else {
        throw new Error('Failed to get AI status');
      }
    } catch (error) {
      console.error('Error getting AI status:', error);
      throw error;
    }
  }

  // Helper method to format trading data for AI analysis
  formatTradingData(stats: any): TradingData {
    return {
      winRate: stats.winRate || 0,
      profitFactor: stats.profitFactor || 0,
      maxDrawdown: stats.maxDrawdown || 0,
      totalTrades: stats.totalTrades || 0,
      averageWin: stats.averageWin || 0,
      averageLoss: stats.averageLoss || 0,
      largestWin: stats.largestWin || 0,
      largestLoss: stats.largestLoss || 0
    };
  }
}

export const aiService = new AIService(); 