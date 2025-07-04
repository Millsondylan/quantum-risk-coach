<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="glass rounded-2xl p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white mb-1">
            Welcome back, Trader!
          </h1>
          <p class="text-[#B2B2B2] text-sm">
            {{ getGreeting() }} • {{ formatDate(new Date()) }}
          </p>
        </div>
        <div class="w-12 h-12 bg-gradient-to-br from-[#2DF4FF] to-[#A34EFF] rounded-xl flex items-center justify-center">
          <span class="text-[#0B0F1A] font-bold text-lg">TN</span>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-2 gap-4">
      <div class="glass rounded-2xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[#B2B2B2] text-sm">Total P&L</span>
          <svg class="w-4 h-4 text-[#2DF4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div class="text-2xl font-bold text-[#00D4AA]">
          $0.00
        </div>
        <div class="text-xs text-[#8A8A8A] mt-1">
          0 trades
        </div>
      </div>

      <div class="glass rounded-2xl p-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-[#B2B2B2] text-sm">Win Rate</span>
          <svg class="w-4 h-4 text-[#A34EFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div class="text-2xl font-bold text-white">
          0.0%
        </div>
        <div class="text-xs text-[#8A8A8A] mt-1">
          0/0
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="glass rounded-2xl p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
      <div class="grid grid-cols-2 gap-4">
        <router-link 
          to="/add-trade"
          class="flex flex-col items-center p-4 bg-gradient-to-br from-[rgba(45,244,255,0.1)] to-[rgba(163,78,255,0.1)] border border-[rgba(45,244,255,0.2)] rounded-xl hover:border-[#2DF4FF] transition-all duration-300 group"
        >
          <div class="w-12 h-12 bg-gradient-to-br from-[#2DF4FF] to-[#A34EFF] rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-[#0B0F1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span class="text-white font-medium text-sm">Add Trade</span>
        </router-link>

        <div class="flex flex-col items-center p-4 bg-gradient-to-br from-[rgba(45,244,255,0.1)] to-[rgba(163,78,255,0.1)] border border-[rgba(45,244,255,0.2)] rounded-xl">
          <div class="w-12 h-12 bg-gradient-to-br from-[#2DF4FF] to-[#A34EFF] rounded-xl flex items-center justify-center mb-3">
            <svg class="w-6 h-6 text-[#0B0F1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span class="text-white font-medium text-sm">AI Coach</span>
        </div>
      </div>
    </div>

    <!-- Recent Trades -->
    <div class="glass rounded-2xl p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-white">Recent Trades</h2>
        <span class="text-[#2DF4FF] text-sm">View All</span>
      </div>
      
      <div class="text-center py-8">
        <div class="w-16 h-16 bg-[rgba(45,244,255,0.1)] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-[#2DF4FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p class="text-[#B2B2B2] text-sm mb-4">No trades yet</p>
        <router-link 
          to="/add-trade"
          class="btn btn-primary text-sm"
        >
          Add Your First Trade
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Methods
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<style scoped>
/* Glass effect */
.glass {
  background: rgba(11, 15, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(45, 244, 255, 0.1);
}

/* Hover effects */
.glass:hover {
  border-color: rgba(45, 244, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
</style> 