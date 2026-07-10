import { defineStore } from 'pinia'
import type { UserProfile, CalculationResult } from '../types'
import { calculatePlan } from '../composables/useCalculator'
import programmesData from '../data/programmes.json'
import type { Programme } from '../types'

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

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: loadFromStorage() as UserProfile | null,
    // key = `${day}:${sessionIndex}:${exerciseIndex}` -> done
    completed: loadProgress() as Record<string, boolean>,
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
    },
    reset() {
      this.profile = null
      this.completed = {}
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(PROGRESS_KEY)
    },
    toggleExercise(key: string) {
      this.completed[key] = !this.completed[key]
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(this.completed))
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
  },
})
