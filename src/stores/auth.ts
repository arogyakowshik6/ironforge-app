import { defineStore } from 'pinia'
import { api, getToken, setToken, clearToken, ApiError } from '../lib/api'

interface AuthUser {
  id: string
  email: string
  name: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as AuthUser | null,
    token: getToken(),
    // becomes true once we've tried to restore a session on app load, so the
    // UI doesn't flash "signed out" while that check is in flight
    ready: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
  },
  actions: {
    async register(email: string, password: string, name: string) {
      const res = await api.post<{ token: string; user: AuthUser }>('/auth/register', {
        email,
        password,
        name,
      })
      this.token = res.token
      this.user = res.user
      setToken(res.token)
    },
    async login(email: string, password: string) {
      const res = await api.post<{ token: string; user: AuthUser }>('/auth/login', {
        email,
        password,
      })
      this.token = res.token
      this.user = res.user
      setToken(res.token)
    },
    logout() {
      this.token = null
      this.user = null
      clearToken()
    },
    async restoreSession() {
      const token = getToken()
      if (!token) {
        this.ready = true
        return
      }
      this.token = token
      try {
        this.user = await api.get<AuthUser>('/auth/me')
      } catch {
        // token expired/invalid — drop it silently, user just sees a
        // signed-out state rather than an error
        this.logout()
      } finally {
        this.ready = true
      }
    },
    handleAuthError(err: unknown) {
      if (err instanceof ApiError && err.status === 401) {
        this.logout()
      }
    },
  },
})
