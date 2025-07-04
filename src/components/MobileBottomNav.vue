<template>
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[rgba(11,15,26,0.95)] to-[rgba(26,34,51,0.95)] backdrop-blur-lg border-t border-[rgba(45,244,255,0.1)]">
    <div class="flex items-center justify-around px-2 py-2">
      <!-- Dashboard -->
      <router-link 
        to="/" 
        class="flex flex-col items-center p-2 rounded-xl transition-all duration-300"
        :class="isActive('/') ? 'bg-[rgba(45,244,255,0.15)] text-[#2DF4FF]' : 'text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)]'"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
        <span class="text-xs font-medium">Dashboard</span>
      </router-link>

      <!-- Add Trade -->
      <router-link 
        to="/add-trade" 
        class="flex flex-col items-center p-2 rounded-xl transition-all duration-300"
        :class="isActive('/add-trade') ? 'bg-[rgba(45,244,255,0.15)] text-[#2DF4FF]' : 'text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)]'"
      >
        <div class="relative">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-[#A34EFF] rounded-full animate-pulse"></div>
        </div>
        <span class="text-xs font-medium">Add Trade</span>
      </router-link>

      <!-- Journal -->
      <router-link 
        to="/journal" 
        class="flex flex-col items-center p-2 rounded-xl transition-all duration-300"
        :class="isActive('/journal') ? 'bg-[rgba(45,244,255,0.15)] text-[#2DF4FF]' : 'text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)]'"
      >
        <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span class="text-xs font-medium">Journal</span>
      </router-link>

      <!-- AI Coach -->
      <router-link 
        to="/ai-coach" 
        class="flex flex-col items-center p-2 rounded-xl transition-all duration-300"
        :class="isActive('/ai-coach') ? 'bg-[rgba(45,244,255,0.15)] text-[#2DF4FF]' : 'text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)]'"
      >
        <div class="relative">
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div v-if="aiCoachStore.isAnalyzing" class="absolute -top-1 -right-1 w-3 h-3 bg-[#FF6F61] rounded-full animate-pulse"></div>
        </div>
        <span class="text-xs font-medium">AI Coach</span>
      </router-link>

      <!-- More Menu -->
      <div class="relative">
        <button 
          @click="toggleMoreMenu"
          class="flex flex-col items-center p-2 rounded-xl transition-all duration-300"
          :class="showMoreMenu ? 'bg-[rgba(45,244,255,0.15)] text-[#2DF4FF]' : 'text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)]'"
        >
          <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span class="text-xs font-medium">More</span>
        </button>

        <!-- More Menu Dropdown -->
        <div v-if="showMoreMenu" class="absolute bottom-full right-0 mb-2 w-48 bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] border border-[rgba(45,244,255,0.2)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-lg">
          <div class="p-1">
            <router-link 
              to="/live-trades"
              @click="showMoreMenu = false"
              class="flex items-center px-3 py-2 text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)] rounded-lg transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Live Trades
            </router-link>
            <router-link 
              to="/history"
              @click="showMoreMenu = false"
              class="flex items-center px-3 py-2 text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)] rounded-lg transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </router-link>
            <router-link 
              to="/news"
              @click="showMoreMenu = false"
              class="flex items-center px-3 py-2 text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)] rounded-lg transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              News
            </router-link>
            <router-link 
              to="/alarms"
              @click="showMoreMenu = false"
              class="flex items-center px-3 py-2 text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)] rounded-lg transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.25 2.25a.75.75 0 0 1-1.5 0V9.75a4.5 4.5 0 0 0-9 0v4.5l2.25 2.25a.75.75 0 0 1-1.5 0V9.75a6 6 0 0 1 6-6z" />
              </svg>
              Alarms
            </router-link>
            <router-link 
              to="/performance-calendar"
              @click="showMoreMenu = false"
              class="flex items-center px-3 py-2 text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)] rounded-lg transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Calendar
            </router-link>
            <router-link 
              to="/settings"
              @click="showMoreMenu = false"
              class="flex items-center px-3 py-2 text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)] rounded-lg transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAICoachStore } from '@/stores/aiCoach'

// Reactive state
const showMoreMenu = ref(false)

// Store and router
const aiCoachStore = useAICoachStore()
const route = useRoute()

// Computed properties
const isActive = (path: string) => route.path === path

// Methods
const toggleMoreMenu = () => {
  showMoreMenu.value = !showMoreMenu.value
}

// Close menu when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.more-menu')) {
    showMoreMenu.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Active link glow effect */
.router-link-active {
  box-shadow: 0 0 12px rgba(45, 244, 255, 0.3);
}

/* Hover effects */
.router-link-active:hover {
  box-shadow: 0 0 16px rgba(45, 244, 255, 0.4);
}

/* Animation for active state */
.router-link-active svg {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style> 