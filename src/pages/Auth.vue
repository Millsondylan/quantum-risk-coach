<template>
  <div class="min-h-screen bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- App Logo -->
      <div class="text-center mb-8">
        <div class="w-20 h-20 bg-gradient-to-br from-[#2DF4FF] to-[#A34EFF] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(45,244,255,0.3)]">
          <span class="text-[#0B0F1A] font-bold text-2xl">TN</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">TradeNote</h1>
        <p class="text-[#B2B2B2] text-lg">Your AI-Powered Trading Journal</p>
      </div>

      <!-- Auth Form -->
      <div class="glass rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
        <div v-if="!isOnboarding" class="space-y-6">
          <!-- Welcome Message -->
          <div class="text-center">
            <h2 class="text-xl font-semibold text-white mb-2">Welcome Back</h2>
            <p class="text-[#B2B2B2] text-sm">Sign in to continue your trading journey</p>
          </div>

          <!-- Demo Login Button -->
          <button 
            @click="demoLogin"
            :disabled="isLoading"
            class="w-full btn btn-primary py-4 text-lg font-semibold"
          >
            <svg v-if="isLoading" class="w-5 h-5 mr-2 quantum-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ isLoading ? 'Signing In...' : 'Continue with Demo' }}
          </button>

          <!-- Divider -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-[rgba(45,244,255,0.2)]"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-[rgba(11,15,26,0.95)] text-[#B2B2B2]">or</span>
            </div>
          </div>

          <!-- Create New Account -->
          <button 
            @click="startOnboarding"
            class="w-full btn btn-secondary py-4 text-lg font-semibold"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Create New Account
          </button>
        </div>

        <!-- Onboarding Form -->
        <div v-else class="space-y-6">
          <div class="text-center">
            <h2 class="text-xl font-semibold text-white mb-2">Setup Your Account</h2>
            <p class="text-[#B2B2B2] text-sm">Let's personalize your trading experience</p>
          </div>

          <form @submit.prevent="completeOnboarding" class="space-y-4">
            <!-- Name Input -->
            <div class="form-group">
              <label class="form-label">Your Name</label>
              <input 
                v-model="form.name"
                type="text"
                class="form-input"
                placeholder="Enter your name"
                required
              />
            </div>

            <!-- Email Input -->
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input 
                v-model="form.email"
                type="email"
                class="form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <!-- Default Currency -->
            <div class="form-group">
              <label class="form-label">Default Currency</label>
              <select v-model="form.currency" class="form-input">
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>

            <!-- Risk Tolerance -->
            <div class="form-group">
              <label class="form-label">Risk Tolerance</label>
              <div class="grid grid-cols-3 gap-2">
                <button 
                  type="button"
                  @click="form.riskTolerance = 'low'"
                  :class="[
                    'p-3 rounded-lg border text-sm font-medium transition-all',
                    form.riskTolerance === 'low' 
                      ? 'bg-[rgba(0,212,170,0.2)] border-[#00D4AA] text-[#00D4AA]' 
                      : 'bg-[rgba(45,244,255,0.1)] border-[rgba(45,244,255,0.2)] text-[#B2B2B2] hover:border-[#2DF4FF]'
                  ]"
                >
                  Conservative
                </button>
                <button 
                  type="button"
                  @click="form.riskTolerance = 'medium'"
                  :class="[
                    'p-3 rounded-lg border text-sm font-medium transition-all',
                    form.riskTolerance === 'medium' 
                      ? 'bg-[rgba(255,184,0,0.2)] border-[#FFB800] text-[#FFB800]' 
                      : 'bg-[rgba(45,244,255,0.1)] border-[rgba(45,244,255,0.2)] text-[#B2B2B2] hover:border-[#2DF4FF]'
                  ]"
                >
                  Balanced
                </button>
                <button 
                  type="button"
                  @click="form.riskTolerance = 'high'"
                  :class="[
                    'p-3 rounded-lg border text-sm font-medium transition-all',
                    form.riskTolerance === 'high' 
                      ? 'bg-[rgba(255,111,97,0.2)] border-[#FF6F61] text-[#FF6F61]' 
                      : 'bg-[rgba(45,244,255,0.1)] border-[rgba(45,244,255,0.2)] text-[#B2B2B2] hover:border-[#2DF4FF]'
                  ]"
                >
                  Aggressive
                </button>
              </div>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit"
              :disabled="isLoading"
              class="w-full btn btn-primary py-4 text-lg font-semibold mt-6"
            >
              <svg v-if="isLoading" class="w-5 h-5 mr-2 quantum-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ isLoading ? 'Setting Up...' : 'Complete Setup' }}
            </button>
          </form>

          <!-- Back to Login -->
          <button 
            @click="isOnboarding = false"
            class="w-full text-center text-[#B2B2B2] hover:text-white transition-colors"
          >
            ← Back to Login
          </button>
        </div>
      </div>

      <!-- Features Preview -->
      <div class="mt-8 text-center">
        <p class="text-[#B2B2B2] text-sm mb-4">Powered by AI • Offline First • Secure</p>
        <div class="flex justify-center space-x-6 text-xs text-[#8A8A8A]">
          <span>📊 Analytics</span>
          <span>🤖 AI Coach</span>
          <span>📱 Mobile</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

// Reactive state
const isLoading = ref(false)
const isOnboarding = ref(false)

const form = reactive({
  name: '',
  email: '',
  currency: 'USD',
  riskTolerance: 'medium' as 'low' | 'medium' | 'high'
})

// Router
const router = useRouter()

// Methods
const demoLogin = async () => {
  try {
    isLoading.value = true
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/')
  } catch (error) {
    console.error('Demo login failed:', error)
  } finally {
    isLoading.value = false
  }
}

const startOnboarding = () => {
  isOnboarding.value = true
}

const completeOnboarding = async () => {
  try {
    isLoading.value = true
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/')
  } catch (error) {
    console.error('Onboarding failed:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Custom form input styling */
.form-input {
  background: rgba(26, 34, 51, 0.8);
  border: 1px solid rgba(45, 244, 255, 0.2);
  color: #FFFFFF;
  transition: all 0.3s ease;
}

.form-input:focus {
  background: rgba(26, 34, 51, 0.9);
  border-color: #2DF4FF;
  box-shadow: 0 0 0 3px rgba(45, 244, 255, 0.1);
}

.form-input::placeholder {
  color: #8A8A8A;
}

/* Glass effect */
.glass {
  background: rgba(11, 15, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(45, 244, 255, 0.1);
}

/* Button hover effects */
.btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 8px 25px rgba(45, 244, 255, 0.3);
}

/* Animation for logo */
@keyframes logo-glow {
  0%, 100% {
    box-shadow: 0 0 30px rgba(45, 244, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 40px rgba(45, 244, 255, 0.5);
  }
}

.w-20.h-20 {
  animation: logo-glow 3s ease-in-out infinite;
}
</style> 