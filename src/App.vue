<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] text-white">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#0B0F1A] to-[#1A2233]">
      <div class="text-center space-y-6">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-[rgba(45,244,255,0.2)] rounded-full animate-spin">
            <div class="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-[#2DF4FF] rounded-full animate-spin"></div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 bg-gradient-to-br from-[#2DF4FF] to-[#A34EFF] rounded-full animate-pulse"></div>
          </div>
        </div>
        <div class="space-y-2">
          <p class="text-white font-medium text-lg">{{ loadingMessage }}</p>
          <p class="text-[#B2B2B2] text-sm">Preparing your trading dashboard...</p>
        </div>
      </div>
    </div>

    <!-- Main App Content -->
    <div v-else class="flex flex-col min-h-screen">
      <!-- Top Navigation -->
      <MobileTopNav v-if="showNavigation" />
      
      <!-- Main Content Area -->
      <main class="flex-1 relative z-10 overflow-y-auto pt-16 pb-24 w-full">
        <div class="container mx-auto px-4 max-w-7xl w-full">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
      
      <!-- Bottom Navigation -->
      <MobileBottomNav v-if="showNavigation" />
    </div>

    <!-- Global Error Boundary -->
    <div v-if="globalError" class="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(11,15,26,0.95)] backdrop-blur-sm">
      <div class="bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] border border-[rgba(255,111,97,0.3)] rounded-2xl p-6 max-w-md mx-4">
        <div class="text-center space-y-4">
          <div class="w-12 h-12 bg-[#FF6F61] rounded-full flex items-center justify-center mx-auto">
            <span class="text-white text-xl">⚠️</span>
          </div>
          <h2 class="text-xl font-semibold text-white">Something went wrong</h2>
          <p class="text-[#B2B2B2] text-sm">{{ globalError }}</p>
          <button 
            @click="handleErrorRetry"
            class="bg-gradient-to-r from-[#2DF4FF] to-[#A34EFF] text-[#0B0F1A] font-semibold px-6 py-3 rounded-xl hover:shadow-[0_0_12px_rgba(45,244,255,0.5)] transition-all duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onErrorCaptured } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import MobileTopNav from '@/components/MobileTopNav.vue'
import MobileBottomNav from '@/components/MobileBottomNav.vue'

// Reactive state
const isLoading = ref(true)
const loadingMessage = ref('Initializing...')
const globalError = ref<string | null>(null)

// Store and router
const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// Computed properties
const showNavigation = computed(() => {
  // Don't show navigation on auth page
  return route.name !== 'Auth'
})

// Methods
const initializeApp = async () => {
  try {
    loadingMessage.value = 'Loading user data...'
    await userStore.initialize()
    
    loadingMessage.value = 'Setting up database...'
    // Initialize other stores here
    
    loadingMessage.value = 'Preparing interface...'
    await new Promise(resolve => setTimeout(resolve, 500))
    
    isLoading.value = false
  } catch (error) {
    console.error('Failed to initialize app:', error)
    globalError.value = 'Failed to initialize the application. Please try again.'
  }
}

const handleErrorRetry = () => {
  globalError.value = null
  isLoading.value = true
  initializeApp()
}

// Error handling
onErrorCaptured((error, instance, info) => {
  console.error('Vue error captured:', error, instance, info)
  globalError.value = 'An unexpected error occurred. Please try again.'
  return false // Prevent error from propagating
})

// Lifecycle
onMounted(() => {
  initializeApp()
})

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
  globalError.value = 'A system error occurred. Please restart the app.'
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  globalError.value = 'An operation failed unexpectedly. Please try again.'
})
</script>

<style scoped>
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Touch optimizations */
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Allow text selection in specific areas */
.selectable-text {
  -webkit-user-select: text;
  -khtml-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
  user-select: text;
}

/* Prevent zoom on input focus */
input, textarea, select {
  font-size: 16px;
  -webkit-user-select: text;
  user-select: text;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(26, 34, 51, 0.5);
}

::-webkit-scrollbar-thumb {
  background: rgba(45, 244, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(45, 244, 255, 0.5);
}
</style> 