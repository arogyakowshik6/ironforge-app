import type { UserProfile, CalculationResult, FitnessGoal } from '../types'

// Protein target (g per kg bodyweight) and fat target (g per kg bodyweight)
// derived from IRONFORGE CROSSFIT programme targets (see spec doc, section per goal).
const GOAL_CONFIG: Record<FitnessGoal, { proteinPerKg: number; fatPerKg: number; calorieDelta: number; label: string }> = {
  'weight-loss': { proteinPerKg: 2.0, fatPerKg: 0.7, calorieDelta: -500, label: 'Weight Loss / Fat Burn' },
  'bulking': { proteinPerKg: 2.25, fatPerKg: 1.05, calorieDelta: 400, label: 'Bulking — Muscle Gain' },
  'cutting': { proteinPerKg: 2.35, fatPerKg: 0.7, calorieDelta: -400, label: 'Cutting — Lean Muscle Retention' },
  'shredding': { proteinPerKg: 2.5, fatPerKg: 0.6, calorieDelta: -650, label: 'Shredding — Competition Ready' },
}

function activityMultiplier(daysAvailable: number, experience: UserProfile['experience']): number {
  const byDays: Record<number, number> = { 3: 1.375, 4: 1.465, 5: 1.55, 6: 1.64, 7: 1.725 }
  const base = byDays[daysAvailable] ?? 1.465
  const nudge = experience === 'advanced' ? 0.05 : experience === 'beginner' ? -0.05 : 0
  return Math.max(1.2, base + nudge)
}

export function calculatePlan(profile: UserProfile): CalculationResult {
  const { age, gender, heightCm, currentWeightKg: weight, goal, daysAvailable, experience } = profile

  // Mifflin-St Jeor BMR
  const base = 10 * weight + 6.25 * heightCm - 5 * age
  let bmr: number
  if (gender === 'male') bmr = base + 5
  else if (gender === 'female') bmr = base - 161
  else bmr = base - 78 // midpoint when undisclosed

  const tdee = bmr * activityMultiplier(daysAvailable, experience)

  const config = GOAL_CONFIG[goal]
  const targetCalories = Math.round(tdee + config.calorieDelta)

  const protein = Math.round(config.proteinPerKg * weight)
  const fats = Math.round(config.fatPerKg * weight)
  const carbCalories = targetCalories - protein * 4 - fats * 9
  const carbs = Math.max(0, Math.round(carbCalories / 4))

  const heightM = heightCm / 100
  const bmi = weight / (heightM * heightM)

  return {
    bmi: Math.round(bmi * 10) / 10,
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    targetCalories,
    calorieDelta: config.calorieDelta,
    macros: { protein, carbs, fats },
    proteinPerKg: config.proteinPerKg,
  }
}

export function goalLabel(goal: FitnessGoal): string {
  return GOAL_CONFIG[goal].label
}
