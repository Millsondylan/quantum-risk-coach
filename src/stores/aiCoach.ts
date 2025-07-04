import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Simplified AI Coach Store
export const useAICoachStore = defineStore('aiCoach', () => {
  // State
  const sessions = ref<any[]>([])
  const strategies = ref<any[]>([])
  const isLoading = ref(false)
  const currentSession = ref<any>(null)

  // Getters
  const recentSessions = computed(() => 
    sessions.value.slice(0, 5).map(session => ({
      id: session.id,
      title: session.title || 'AI Analysis Session',
      content: session.content || 'No content available',
      sentiment: session.sentiment || 'neutral',
      timestamp: session.timestamp || Date.now()
    }))
  )

  const activeStrategies = computed(() => 
    strategies.value.filter(strategy => strategy.active)
  )

  // Actions
  const initialize = async () => {
    try {
      isLoading.value = true
      // Load sessions and strategies from local storage
      const savedSessions = localStorage.getItem('aiCoachSessions')
      const savedStrategies = localStorage.getItem('aiStrategies')
      
      if (savedSessions) {
        sessions.value = JSON.parse(savedSessions)
      }
      
      if (savedStrategies) {
        strategies.value = JSON.parse(savedStrategies)
      }
    } catch (error) {
      console.error('Failed to initialize AI Coach store:', error)
    } finally {
      isLoading.value = false
    }
  }

  const createSession = async (type: string, data: any) => {
    try {
      isLoading.value = true
      
      const session = {
        id: `session_${Date.now()}`,
        type,
        title: `AI ${type} Analysis`,
        content: `AI analysis for ${type} is being generated...`,
        sentiment: 'neutral',
        timestamp: Date.now(),
        data
      }
      
      sessions.value.unshift(session)
      currentSession.value = session
      
      // Save to localStorage
      localStorage.setItem('aiCoachSessions', JSON.stringify(sessions.value))
      
      return session
    } catch (error) {
      console.error('Failed to create AI session:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateSession = async (sessionId: string, updates: any) => {
    const sessionIndex = sessions.value.findIndex(s => s.id === sessionId)
    if (sessionIndex !== -1) {
      sessions.value[sessionIndex] = { ...sessions.value[sessionIndex], ...updates }
      localStorage.setItem('aiCoachSessions', JSON.stringify(sessions.value))
    }
  }

  const createStrategy = async (name: string, description: string) => {
    try {
      isLoading.value = true
      
      const strategy = {
        id: `strategy_${Date.now()}`,
        name,
        description,
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      
      strategies.value.push(strategy)
      localStorage.setItem('aiStrategies', JSON.stringify(strategies.value))
      
      return strategy
    } catch (error) {
      console.error('Failed to create AI strategy:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const toggleStrategy = async (strategyId: string) => {
    const strategy = strategies.value.find(s => s.id === strategyId)
    if (strategy) {
      strategy.active = !strategy.active
      strategy.updatedAt = Date.now()
      localStorage.setItem('aiStrategies', JSON.stringify(strategies.value))
    }
  }

  const deleteStrategy = async (strategyId: string) => {
    strategies.value = strategies.value.filter(s => s.id !== strategyId)
    localStorage.setItem('aiStrategies', JSON.stringify(strategies.value))
  }

  const clearSessions = () => {
    sessions.value = []
    localStorage.removeItem('aiCoachSessions')
  }

  const clearStrategies = () => {
    strategies.value = []
    localStorage.removeItem('aiStrategies')
  }

  return {
    // State
    sessions,
    strategies,
    isLoading,
    currentSession,
    
    // Getters
    recentSessions,
    activeStrategies,
    
    // Actions
    initialize,
    createSession,
    updateSession,
    createStrategy,
    toggleStrategy,
    deleteStrategy,
    clearSessions,
    clearStrategies
  }
}) 