import { createRouter, createWebHistory } from 'vue-router'
import { useProfileStore } from '../stores/profile'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'onboarding', component: () => import('../views/OnboardingView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/AuthView.vue') },
    { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresProfile: true } },
    { path: '/day/:day', name: 'day', component: () => import('../views/DayView.vue'), meta: { requiresProfile: true }, props: true },
    { path: '/diet', name: 'diet', component: () => import('../views/DietView.vue'), meta: { requiresProfile: true } },
  ],
})

router.beforeEach((to) => {
  const store = useProfileStore()
  if (to.meta.requiresProfile && !store.isOnboarded) {
    return { name: 'onboarding' }
  }
  return true
})

export default router
