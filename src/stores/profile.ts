import { defineStore } from 'pinia'
import type { UserProfile, CalculationResult } from '../types'
import { calculatePlan } from '../composables/useCalculator'
import programmesData from '../data/programmes.json'
import type { Programme } from '../types'
import { api } from '../lib/api'
import { useAuthStore } from './auth'

const STORAGE_KEY = 'ironforge:profile'
const PROGRESS_KEY = 'ironforge:progress'

function loadFromStorage(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function loadProgress(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

// Shape returned by GET /api/workouts/:goalKey on the server.
interface ServerExercise {
  id: string
  sessionIndex: number
  exerciseIndex: number
}
interface ServerWorkout {
  day: number
  exercises: ServerExercise[]
}

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: loadFromStorage() as UserProfile | null,
    // key = `${day}:${sessionIndex}:${exerciseIndex}` -> done (always the
    // source of truth for the UI; server sync reads/writes through this)
    completed: loadProgress() as Record<string, boolean>,
    // composite key -> server Exercise UUID, populated by syncFromServer()
    exerciseIdMap: {} as Record<string, string>,
    syncing: false,
  }),
  getters: {
    isOnboarded: (state) => state.profile !== null,
    result(state): CalculationResult | null {
      return state.profile ? calculatePlan(state.profile) : null
    },
    programme(state): Programme | null {
      if (!state.profile) return null
      const all = (programmesData as { programmes: Programme[] }).programmes
      return all.find((p) => p.key === state.profile!.goal) ?? null
    },
    totalExercises(): number {
      if (!this.programme) return 0
      return this.programme.days.reduce(
        (sum, d) => sum + d.sessions.reduce((s, sess) => s + sess.exercises.length, 0),
        0
      )
    },
    completedCount(state): number {
      return Object.values(state.completed).filter(Boolean).length
    },
    weekProgressPct(): number {
      if (this.totalExercises === 0) return 0
      return Math.round((this.completedCount / this.totalExercises) * 100)
    },
  },
  actions: {
    setProfile(profile: UserProfile) {
      this.profile = profile
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))

      const auth = useAuthStore()
      if (auth.isAuthenticated) {
        api.put('/profile', profile).catch(() => {
          // best-effort — local copy is already saved, so the UI keeps working
          // even if the API is unreachable
        })
        this.loadExerciseIdMap()
      }
    },
    reset() {
      this.profile = null
      this.completed = {}
      this.exerciseIdMap = {}
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(PROGRESS_KEY)
    },
    toggleExercise(key: string) {
      this.completed[key] = !this.completed[key]
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.completed))

      const auth = useAuthStore()
      const exerciseId = this.exerciseIdMap[key]
      if (auth.isAuthenticated && exerciseId) {
        api
          .put('/progress/toggle', { exerciseId, completed: this.completed[key] })
          .catch(() => {
            // best-effort — local state already reflects the toggle
          })
      }
    },
    dayProgress(day: number): { done: number; total: number } {
      const d = this.programme?.days.find((x) => x.day === day)
      if (!d) return { done: 0, total: 0 }
      let total = 0
      let done = 0
      d.sessions.forEach((sess, si) => {
        sess.exercises.forEach((_, ei) => {
          total++
          if (this.completed[`${day}:${si}:${ei}`]) done++
        })
      })
      return { done, total }
    },
    // Builds the composite-key -> server-UUID map for the current goal. The
    // server's seeded Exercise rows come from the same source JSON as the
    // frontend bundle, so day/sessionIndex/exerciseIndex line up exactly.
    async loadExerciseIdMap() {
      if (!this.profile) return
      try {
        const workouts = await api.get<ServerWorkout[]>(`/workouts/${this.profile.goal}`)
        const map: Record<string, string> = {}
        for (const w of workouts) {
          for (const ex of w.exercises) {
            map[`${w.day}:${ex.sessionIndex}:${ex.exerciseIndex}`] = ex.id
          }
        }
        this.exerciseIdMap = map
      } catch {
        // server unreachable — local-only mode continues to work
      }
    },
    // Called after login/register and on app load when a session exists.
    // Server data wins so progress made on another device shows up here.
    async syncFromServer() {
      const auth = useAuthStore()
      if (!auth.isAuthenticated) return
      this.syncing = true
      try {
        try {
          const profile = await api.get<UserProfile>('/profile')
          this.profile = profile
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
        } catch {
          // no server profile yet (404) — keep whatever's local, if anything
        }

        if (this.profile) {
          await this.loadExerciseIdMap()
          const reverseMap = Object.fromEntries(
            Object.entries(this.exerciseIdMap).map(([key, id]) => [id, key])
          )
          const { completedExerciseIds } = await api.get<{ completedExerciseIds: string[] }>(
            '/progress'
          )
          const merged: Record<string, boolean> = {}
          for (const id of completedExerciseIds) {
            const key = reverseMap[id]
            if (key) merged[key] = true
          }
          this.completed = merged
          localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged))
        }
      } catch {
        // server unreachable — local-only mode continues to work
      } finally {
        this.syncing = false
      }
    },
  },
})
