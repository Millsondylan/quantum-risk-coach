import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { localDatabase } from '@/lib/localDatabase'
import { logger } from '@/lib/logger'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  onboardingCompleted: boolean
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
    biometricAuth: boolean
    defaultCurrency: string
    timezone: string
  }
  settings: {
    apiKeys: {
      openai?: string
      groq?: string
      gemini?: string
      polygon?: string
      alphaVantage?: string
    }
    tradingSettings: {
      defaultLeverage: number
      riskPerTrade: number
      maxOpenTrades: number
    }
  }
  createdAt: string
  updatedAt: string
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const isOnboardingCompleted = computed(() => user.value?.onboardingCompleted ?? false)
  const userPreferences = computed(() => user.value?.preferences)
  const userSettings = computed(() => user.value?.settings)

  // Actions
  const initialize = async () => {
    try {
      isLoading.value = true
      error.value = null

      // Check if user exists in local storage
      const storedUser = await localDatabase.getUser()
      if (storedUser) {
        user.value = storedUser
        logger.info('User loaded from local storage')
        return
      }

      // Create default user if none exists
      await createDefaultUser()
    } catch (err) {
      error.value = 'Failed to initialize user store'
      logger.error('User store initialization failed:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createDefaultUser = async () => {
    const defaultUser: User = {
      id: crypto.randomUUID(),
      email: 'demo@tradenote.com',
      name: 'Demo Trader',
      onboardingCompleted: false,
      preferences: {
        theme: 'dark',
        notifications: true,
        biometricAuth: false,
        defaultCurrency: 'USD',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      settings: {
        apiKeys: {},
        tradingSettings: {
          defaultLeverage: 1,
          riskPerTrade: 2,
          maxOpenTrades: 5
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await localDatabase.saveUser(defaultUser)
    user.value = defaultUser
    logger.info('Default user created')
  }

  const updateUser = async (updates: Partial<User>) => {
    try {
      if (!user.value) {
        throw new Error('No user to update')
      }

      const updatedUser = {
        ...user.value,
        ...updates,
        updatedAt: new Date().toISOString()
      }

      await localDatabase.saveUser(updatedUser)
      user.value = updatedUser
      logger.info('User updated successfully')
    } catch (err) {
      error.value = 'Failed to update user'
      logger.error('User update failed:', err)
      throw err
    }
  }

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    if (!user.value) return

    await updateUser({
      preferences: {
        ...user.value.preferences,
        ...preferences
      }
    })
  }

  const updateSettings = async (settings: Partial<User['settings']>) => {
    if (!user.value) return

    await updateUser({
      settings: {
        ...user.value.settings,
        ...settings
      }
    })
  }

  const completeOnboarding = async () => {
    await updateUser({ onboardingCompleted: true })
  }

  const logout = async () => {
    try {
      // Clear user data
      await localDatabase.clearUser()
      user.value = null
      error.value = null
      logger.info('User logged out')
    } catch (err) {
      logger.error('Logout failed:', err)
      throw err
    }
  }

  const resetUser = async () => {
    try {
      await logout()
      await createDefaultUser()
      logger.info('User reset completed')
    } catch (err) {
      logger.error('User reset failed:', err)
      throw err
    }
  }

  return {
    // State
    user,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isOnboardingCompleted,
    userPreferences,
    userSettings,

    // Actions
    initialize,
    updateUser,
    updatePreferences,
    updateSettings,
    completeOnboarding,
    logout,
    resetUser
  }
}) 