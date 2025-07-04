import { createRouter, createWebHistory } from 'vue-router'

// Import pages
import Auth from '@/pages/Auth.vue'
import Index from '@/pages/Index.vue'
import AddTrade from '@/pages/AddTrade.vue'

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Index',
    component: Index,
    meta: { requiresAuth: true }
  },
  {
    path: '/add-trade',
    name: 'AddTrade',
    component: AddTrade,
    meta: { requiresAuth: true }
  },
  // Catch all route - redirect to home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // For now, allow all routes - we'll implement auth later
  next()
})

export default router 