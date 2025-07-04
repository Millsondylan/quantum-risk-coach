import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { localDatabase } from '@/lib/localDatabase'
import { logger } from '@/lib/logger'

export interface Trade {
  id: string
  symbol: string
  type: 'long' | 'short' | 'buy' | 'sell'
  side: 'buy' | 'sell'
  quantity: number
  amount?: number
  entryPrice: number
  price?: number
  exitPrice?: number
  pnl?: number
  profit?: number
  profitLoss?: number
  status: 'open' | 'closed' | 'cancelled' | 'pending'
  entryTime: string
  entryDate?: string
  exitTime?: string
  exitDate?: string
  notes?: string
  strategy?: string
  tags?: string[]
  accountId?: string
  fee?: number
  stopLoss?: number
  takeProfit?: number
  riskReward?: number
  riskRewardRatio?: number
  confidence?: number
  confidenceRating?: number
  emotion?: string
  mood?: string
  exitReason?: string
  currentPrice?: number
  useCurrentPrice?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface TradeStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  averagePnL: number
  largestWin: number
  largestLoss: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  consecutiveWins: number
  consecutiveLosses: number
}

export const useTradeStore = defineStore('trade', () => {
  // State
  const trades = ref<Trade[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedTrade = ref<Trade | null>(null)

  // Getters
  const openTrades = computed(() => trades.value.filter(trade => trade.status === 'open'))
  const closedTrades = computed(() => trades.value.filter(trade => trade.status === 'closed'))
  const recentTrades = computed(() => 
    trades.value
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
  )

  const tradeStats = computed((): TradeStats => {
    const closed = closedTrades.value
    const total = closed.length
    const winning = closed.filter(t => (t.pnl || 0) > 0).length
    const losing = total - winning

    const totalPnL = closed.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const winningTrades = closed.filter(t => (t.pnl || 0) > 0)
    const losingTrades = closed.filter(t => (t.pnl || 0) <= 0)

    const totalWins = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0)
    const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0))

    return {
      totalTrades: total,
      winningTrades: winning,
      losingTrades: losing,
      winRate: total > 0 ? (winning / total) * 100 : 0,
      totalPnL,
      averagePnL: total > 0 ? totalPnL / total : 0,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl || 0)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl || 0)) : 0,
      averageWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0,
      sharpeRatio: 0, // TODO: Calculate Sharpe ratio
      maxDrawdown: 0, // TODO: Calculate max drawdown
      consecutiveWins: 0, // TODO: Calculate consecutive wins
      consecutiveLosses: 0 // TODO: Calculate consecutive losses
    }
  })

  // Actions
  const initialize = async () => {
    try {
      isLoading.value = true
      error.value = null

      const storedTrades = await localDatabase.getTrades()
      trades.value = storedTrades || []
      logger.info(`Loaded ${trades.value.length} trades from database`)
    } catch (err) {
      error.value = 'Failed to initialize trade store'
      logger.error('Trade store initialization failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addTrade = async (tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newTrade: Trade = {
        ...tradeData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      await localDatabase.saveTrade(newTrade)
      trades.value.push(newTrade)
      logger.info('Trade added successfully')
      return newTrade
    } catch (err) {
      error.value = 'Failed to add trade'
      logger.error('Add trade failed:', err)
      throw err
    }
  }

  const updateTrade = async (id: string, updates: Partial<Trade>) => {
    try {
      const index = trades.value.findIndex(t => t.id === id)
      if (index === -1) {
        throw new Error('Trade not found')
      }

      const updatedTrade = {
        ...trades.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      await localDatabase.saveTrade(updatedTrade)
      trades.value[index] = updatedTrade
      logger.info('Trade updated successfully')
      return updatedTrade
    } catch (err) {
      error.value = 'Failed to update trade'
      logger.error('Update trade failed:', err)
      throw err
    }
  }

  const closeTrade = async (id: string, exitPrice: number, exitTime?: string) => {
    const trade = trades.value.find(t => t.id === id)
    if (!trade) {
      throw new Error('Trade not found')
    }

    const pnl = (exitPrice - trade.entryPrice) * trade.quantity

    await updateTrade(id, {
      exitPrice,
      exitTime: exitTime || new Date().toISOString(),
      pnl,
      status: 'closed'
    })
  }

  const deleteTrade = async (id: string) => {
    try {
      await localDatabase.deleteTrade(id)
      trades.value = trades.value.filter(t => t.id !== id)
      logger.info('Trade deleted successfully')
    } catch (err) {
      error.value = 'Failed to delete trade'
      logger.error('Delete trade failed:', err)
      throw err
    }
  }

  const getTradeById = (id: string) => {
    return trades.value.find(t => t.id === id) || null
  }

  const selectTrade = (trade: Trade | null) => {
    selectedTrade.value = trade
  }

  const getTradesBySymbol = (symbol: string) => {
    return trades.value.filter(t => t.symbol.toLowerCase() === symbol.toLowerCase())
  }

  const getTradesByDateRange = (startDate: string, endDate: string) => {
    return trades.value.filter(t => {
      const tradeDate = new Date(t.entryTime)
      return tradeDate >= new Date(startDate) && tradeDate <= new Date(endDate)
    })
  }

  const getTradesByStrategy = (strategy: string) => {
    return trades.value.filter(t => t.strategy === strategy)
  }

  const clearAllTrades = async () => {
    try {
      await localDatabase.clearTrades()
      trades.value = []
      selectedTrade.value = null
      logger.info('All trades cleared')
    } catch (err) {
      error.value = 'Failed to clear trades'
      logger.error('Clear trades failed:', err)
      throw err
    }
  }

  return {
    // State
    trades,
    isLoading,
    error,
    selectedTrade,

    // Getters
    openTrades,
    closedTrades,
    recentTrades,
    tradeStats,

    // Actions
    initialize,
    addTrade,
    updateTrade,
    closeTrade,
    deleteTrade,
    getTradeById,
    selectTrade,
    getTradesBySymbol,
    getTradesByDateRange,
    getTradesByStrategy,
    clearAllTrades
  }
}) 