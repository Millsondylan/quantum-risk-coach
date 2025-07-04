<template>
  <nav class="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-[rgba(11,15,26,0.95)] to-[rgba(26,34,51,0.95)] backdrop-blur-lg border-b border-[rgba(45,244,255,0.1)]">
    <div class="flex items-center justify-between px-4 py-3">
      <!-- Left: App Logo/Title -->
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 bg-gradient-to-br from-[#2DF4FF] to-[#A34EFF] rounded-lg flex items-center justify-center">
          <span class="text-[#0B0F1A] font-bold text-sm">TN</span>
        </div>
        <div>
          <h1 class="text-white font-semibold text-lg">TradeNote</h1>
          <p class="text-[#B2B2B2] text-xs">Mobile Trading Journal</p>
        </div>
      </div>

      <!-- Right: User Menu & Notifications -->
      <div class="flex items-center space-x-3">
        <!-- Notifications -->
        <button 
          @click="toggleNotifications"
          class="relative p-2 rounded-xl bg-[rgba(45,244,255,0.1)] border border-[rgba(45,244,255,0.2)] hover:bg-[rgba(45,244,255,0.15)] transition-all duration-300"
        >
          <svg class="w-5 h-5 text-[#2DF4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v4.5l2.25 2.25a.75.75 0 0 1-1.5 0V9.75a4.5 4.5 0 0 0-9 0v4.5l2.25 2.25a.75.75 0 0 1-1.5 0V9.75a6 6 0 0 1 6-6z" />
          </svg>
          <span v-if="notificationCount > 0" class="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6F61] rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">{{ notificationCount }}</span>
          </span>
        </button>

        <!-- User Menu -->
        <div class="relative">
          <button 
            @click="toggleUserMenu"
            class="flex items-center space-x-2 p-2 rounded-xl bg-[rgba(45,244,255,0.1)] border border-[rgba(45,244,255,0.2)] hover:bg-[rgba(45,244,255,0.15)] transition-all duration-300"
          >
            <div class="w-6 h-6 bg-gradient-to-br from-[#2DF4FF] to-[#A34EFF] rounded-full flex items-center justify-center">
              <span class="text-[#0B0F1A] font-bold text-xs">{{ userInitials }}</span>
            </div>
            <svg class="w-4 h-4 text-[#2DF4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- User Dropdown Menu -->
          <div v-if="showUserMenu" class="absolute right-0 top-full mt-2 w-48 bg-gradient-to-br from-[#0B0F1A] to-[#1A2233] border border-[rgba(45,244,255,0.2)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-lg">
            <div class="p-3 border-b border-[rgba(45,244,255,0.1)]">
              <p class="text-white font-medium">{{ userStore.user?.name }}</p>
              <p class="text-[#B2B2B2] text-sm">{{ userStore.user?.email }}</p>
            </div>
            <div class="p-1">
              <button 
                @click="goToSettings"
                class="w-full text-left px-3 py-2 text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)] rounded-lg transition-colors duration-200"
              >
                Settings
              </button>
              <button 
                @click="goToProfile"
                class="w-full text-left px-3 py-2 text-[#B2B2B2] hover:text-white hover:bg-[rgba(45,244,255,0.1)] rounded-lg transition-colors duration-200"
              >
                Profile
              </button>
              <button 
                @click="logout"
                class="w-full text-left px-3 py-2 text-[#FF6F61] hover:text-white hover:bg-[rgba(255,111,97,0.1)] rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notifications Panel -->
    <div v-if="showNotifications" class="border-t border-[rgba(45,244,255,0.1)] bg-[rgba(11,15,26,0.95)] backdrop-blur-lg">
      <div class="p-4 max-h-64 overflow-y-auto">
        <div v-if="notifications.length === 0" class="text-center py-4">
          <p class="text-[#B2B2B2] text-sm">No notifications</p>
        </div>
        <div v-else class="space-y-3">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="p-3 bg-[rgba(45,244,255,0.05)] border border-[rgba(45,244,255,0.1)] rounded-lg"
          >
            <p class="text-white text-sm font-medium">{{ notification.title }}</p>
            <p class="text-[#B2B2B2] text-xs mt-1">{{ notification.message }}</p>
            <p class="text-[#B2B2B2] text-xs mt-2">{{ formatTime(notification.timestamp) }}</p>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Reactive state
const showUserMenu = ref(false)
const showNotifications = ref(false)
const notifications = ref([
  {
    id: '1',
    title: 'Trade Alert',
    message: 'EURUSD reached your target price',
    timestamp: new Date(Date.now() - 300000) // 5 minutes ago
  },
  {
    id: '2',
    title: 'AI Analysis Ready',
    message: 'Your weekly performance analysis is complete',
    timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
  }
])

// Store and router
const userStore = useUserStore()
const router = useRouter()

// Computed properties
const userInitials = computed(() => {
  const name = userStore.user?.name || 'User'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
})

const notificationCount = computed(() => notifications.value.length)

// Methods
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showNotifications.value = false
  }
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    showUserMenu.value = false
  }
}

const goToSettings = () => {
  showUserMenu.value = false
  router.push('/settings')
}

const goToProfile = () => {
  showUserMenu.value = false
  router.push('/profile')
}

const logout = async () => {
  showUserMenu.value = false
  try {
    await userStore.logout()
    router.push('/auth')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// Close menus when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.user-menu') && !target.closest('.notifications-menu')) {
    showUserMenu.value = false
    showNotifications.value = false
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
/* Custom scrollbar for notifications */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: rgba(26, 34, 51, 0.5);
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(45, 244, 255, 0.3);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(45, 244, 255, 0.5);
}
</style> 