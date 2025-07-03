const express = require('express');
const router = express.Router();

// AI Coaching Service - This would integrate with OpenAI, Anthropic, or other AI providers
class AICoachingService {
  constructor() {
    // In a real implementation, you would initialize your AI client here
    // this.aiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateInsights(tradingData) {
    // Analyze trading performance and generate insights
    const insights = [];
    
    const { winRate, profitFactor, maxDrawdown, totalTrades, averageWin, averageLoss } = tradingData;
    
    // Win Rate Analysis
    if (winRate < 50) {
      insights.push({
        id: 'win-rate-low',
        type: 'improvement',
        title: 'Improve Win Rate',
        description: `Your current win rate of ${winRate.toFixed(1)}% is below the recommended 50% threshold. Focus on trade selection and entry timing.`,
        impact: 'high',
        actionItems: [
          'Review your entry criteria and wait for higher probability setups',
          'Analyze your losing trades to identify common patterns',
          'Consider reducing position sizes until win rate improves',
          'Focus on trading during optimal market conditions'
        ]
      });
    } else if (winRate >= 60) {
      insights.push({
        id: 'win-rate-excellent',
        type: 'strength',
        title: 'Excellent Win Rate',
        description: `Your win rate of ${winRate.toFixed(1)}% is excellent! You're showing strong trade selection skills.`,
        impact: 'high',
        actionItems: [
          'Maintain your current entry criteria',
          'Consider increasing position sizes gradually',
          'Document your successful patterns for future reference'
        ]
      });
    }

    // Profit Factor Analysis
    if (profitFactor < 1.0) {
      insights.push({
        id: 'profit-factor-low',
        type: 'warning',
        title: 'Profit Factor Needs Improvement',
        description: `Your profit factor of ${profitFactor.toFixed(2)} indicates you're losing more than you're winning. Focus on risk management.`,
        impact: 'high',
        actionItems: [
          'Review your risk-reward ratios - aim for at least 1:2',
          'Improve your exit strategies to cut losses faster',
          'Consider using stop-loss orders more consistently',
          'Analyze your largest losses to prevent similar mistakes'
        ]
      });
    } else if (profitFactor >= 1.5) {
      insights.push({
        id: 'profit-factor-excellent',
        type: 'strength',
        title: 'Strong Profit Factor',
        description: `Your profit factor of ${profitFactor.toFixed(2)} shows excellent risk management and reward capture.`,
        impact: 'high',
        actionItems: [
          'Continue your current risk management approach',
          'Consider scaling into winning positions',
          'Document your exit strategies for consistency'
        ]
      });
    }

    // Drawdown Analysis
    if (Math.abs(maxDrawdown) > 20) {
      insights.push({
        id: 'drawdown-high',
        type: 'warning',
        title: 'High Maximum Drawdown',
        description: `Your maximum drawdown of ${Math.abs(maxDrawdown).toFixed(1)}% is above the recommended 10-15% threshold.`,
        impact: 'high',
        actionItems: [
          'Reduce position sizes immediately',
          'Implement stricter stop-loss rules',
          'Consider taking a trading break to reset',
          'Review your risk per trade - should be 1-2% max'
        ]
      });
    }

    // Experience Level
    if (totalTrades < 20) {
      insights.push({
        id: 'experience-low',
        type: 'tip',
        title: 'Building Trading Experience',
        description: `With ${totalTrades} trades, you're still building your trading experience. Focus on consistency over profits.`,
        impact: 'medium',
        actionItems: [
          'Continue paper trading to build confidence',
          'Keep detailed trade journals',
          'Focus on process over outcomes',
          'Don\'t increase position sizes until you have 50+ trades'
        ]
      });
    }

    // Risk-Reward Analysis
    if (averageWin && averageLoss) {
      const riskRewardRatio = Math.abs(averageWin / averageLoss);
      if (riskRewardRatio < 1.5) {
        insights.push({
          id: 'risk-reward-poor',
          type: 'improvement',
          title: 'Improve Risk-Reward Ratio',
          description: `Your average risk-reward ratio of ${riskRewardRatio.toFixed(2)} is below the recommended 1.5:1 minimum.`,
          impact: 'medium',
          actionItems: [
            'Look for trades with better risk-reward setups',
            'Improve your exit strategies to let winners run',
            'Cut losses faster to reduce average loss size',
            'Focus on higher probability setups'
          ]
        });
      }
    }

    return insights;
  }

  async generateChatResponse(message, tradingData) {
    // In a real implementation, this would call an AI API
    // For now, we'll provide intelligent responses based on the message content
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('win rate') || lowerMessage.includes('winrate')) {
      const { winRate } = tradingData;
      if (winRate < 50) {
        return {
          response: `Your current win rate is ${winRate.toFixed(1)}%, which is below the recommended 50% threshold. To improve your win rate, I recommend:

1. **Review your entry criteria** - Only take trades that meet all your setup requirements
2. **Wait for better setups** - Don't force trades when conditions aren't optimal
3. **Analyze losing trades** - Look for common patterns in your losses
4. **Reduce position sizes** - Smaller positions can help with emotional control

Would you like me to analyze your recent trades to identify specific patterns?`
        };
      } else {
        return {
          response: `Great news! Your win rate of ${winRate.toFixed(1)}% is excellent. You're showing strong trade selection skills. To maintain this performance:

1. **Document your patterns** - Keep track of what setups work best for you
2. **Consider scaling up** - Gradually increase position sizes
3. **Stay disciplined** - Don't get overconfident and deviate from your strategy
4. **Monitor for changes** - Market conditions change, so stay adaptable

Keep up the great work!`
        };
      }
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('management')) {
      const { profitFactor, maxDrawdown } = tradingData;
      return {
        response: `Based on your trading data, here's my risk management assessment:

**Profit Factor**: ${profitFactor.toFixed(2)} ${profitFactor >= 1.5 ? '✅ Excellent' : profitFactor >= 1.0 ? '⚠️ Needs improvement' : '❌ Critical'}
**Max Drawdown**: ${Math.abs(maxDrawdown).toFixed(1)}% ${Math.abs(maxDrawdown) <= 10 ? '✅ Well controlled' : Math.abs(maxDrawdown) <= 20 ? '⚠️ Moderate' : '❌ Too high'}

**Recommendations:**
1. **Position Sizing**: Risk no more than 1-2% per trade
2. **Stop Losses**: Always use stop losses and stick to them
3. **Risk-Reward**: Aim for at least 1:2 risk-reward ratio
4. **Drawdown Limits**: Stop trading if you reach 10% drawdown

Would you like me to help you calculate optimal position sizes for your account?`
      };
    }
    
    if (lowerMessage.includes('psychology') || lowerMessage.includes('emotion')) {
      return {
        response: `Trading psychology is crucial for long-term success. Here are key principles:

**Emotional Control:**
- Stick to your trading plan regardless of wins or losses
- Don't chase losses or get overconfident after wins
- Take breaks when you're feeling emotional

**Mindset Tips:**
- Focus on process over outcomes
- Treat each trade as independent
- Journal your emotions and thoughts
- Practice meditation or breathing exercises

**Common Psychological Traps:**
- FOMO (Fear of Missing Out)
- Revenge trading after losses
- Overconfidence after winning streaks
- Analysis paralysis

Remember: The market will always be there tomorrow. It's better to miss a trade than to take a bad one.`
      };
    }
    
    if (lowerMessage.includes('strategy') || lowerMessage.includes('system')) {
      return {
        response: `A solid trading strategy should include:

**Entry Criteria:**
- Clear setup requirements
- Multiple confirmation signals
- Defined market conditions

**Risk Management:**
- Fixed risk per trade (1-2%)
- Stop loss placement
- Position sizing rules

**Exit Strategy:**
- Take profit targets
- Trailing stops
- Time-based exits

**System Rules:**
- When to trade and when not to
- Maximum number of concurrent positions
- Daily/weekly loss limits

**Key Questions to Ask:**
1. What setups work best for you?
2. What's your edge in the market?
3. How do you handle losing streaks?
4. What's your long-term goal?

Would you like me to help you develop a specific strategy based on your trading style?`
      };
    }
    
    // Default response
    return {
      response: `I'm here to help you improve your trading performance! I can assist with:

• **Performance Analysis** - Review your win rate, profit factor, and drawdown
• **Risk Management** - Optimize position sizing and stop losses
• **Psychology Coaching** - Handle emotions and maintain discipline
• **Strategy Development** - Build and refine your trading system
• **Trade Review** - Analyze specific trades for improvement

What would you like to focus on today?`
    };
  }

  async generateGoals(tradingData) {
    const { winRate, profitFactor, maxDrawdown, totalTrades } = tradingData;
    
    const goals = [];
    
    // Win Rate Goal
    if (winRate < 50) {
      goals.push({
        metric: 'Win Rate',
        current: winRate,
        target: 55,
        timeframe: '3 months',
        priority: 'high'
      });
    } else if (winRate < 60) {
      goals.push({
        metric: 'Win Rate',
        current: winRate,
        target: 65,
        timeframe: '6 months',
        priority: 'medium'
      });
    }
    
    // Profit Factor Goal
    if (profitFactor < 1.0) {
      goals.push({
        metric: 'Profit Factor',
        current: profitFactor,
        target: 1.2,
        timeframe: '3 months',
        priority: 'high'
      });
    } else if (profitFactor < 1.5) {
      goals.push({
        metric: 'Profit Factor',
        current: profitFactor,
        target: 1.8,
        timeframe: '6 months',
        priority: 'medium'
      });
    }
    
    // Drawdown Goal
    if (Math.abs(maxDrawdown) > 15) {
      goals.push({
        metric: 'Max Drawdown',
        current: Math.abs(maxDrawdown),
        target: 10,
        timeframe: 'Immediate',
        priority: 'critical'
      });
    }
    
    // Experience Goal
    if (totalTrades < 50) {
      goals.push({
        metric: 'Total Trades',
        current: totalTrades,
        target: 50,
        timeframe: '3 months',
        priority: 'medium'
      });
    }
    
    return goals;
  }
}

const aiService = new AICoachingService();

// Generate AI insights based on trading data
router.post('/insights', async (req, res) => {
  try {
    const { tradingData } = req.body;
    
    if (!tradingData) {
      return res.status(400).json({
        error: 'Trading data is required'
      });
    }
    
    const insights = await aiService.generateInsights(tradingData);
    
    res.json({
      success: true,
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      error: 'Failed to generate insights',
      message: error.message
    });
  }
});

// Chat with AI coach
router.post('/chat', async (req, res) => {
  try {
    const { message, tradingData } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }
    
    const response = await aiService.generateChatResponse(message, tradingData || {});
    
    res.json({
      success: true,
      response: response.response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating chat response:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      message: error.message
    });
  }
});

// Generate trading goals
router.post('/goals', async (req, res) => {
  try {
    const { tradingData } = req.body;
    
    if (!tradingData) {
      return res.status(400).json({
        error: 'Trading data is required'
      });
    }
    
    const goals = await aiService.generateGoals(tradingData);
    
    res.json({
      success: true,
      goals,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating goals:', error);
    res.status(500).json({
      error: 'Failed to generate goals',
      message: error.message
    });
  }
});

// Get AI coach status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    status: 'active',
    features: ['insights', 'chat', 'goals', 'analysis'],
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 