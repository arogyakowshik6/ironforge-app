declare function describe(name: string, fn: () => void): void
declare function it(name: string, fn: () => void): void
declare function expect(actual: any): any
import { calculatePlan, goalLabel } from './useCalculator'
import type { UserProfile } from '../types'

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    name: 'Test User',
    age: 30,
    gender: 'male',
    heightCm: 180,
    currentWeightKg: 80,
    targetWeightKg: 75,
    bodyType: 'mesomorph',
    experience: 'intermediate',
    goal: 'weight-loss',
    daysAvailable: 5,
    equipment: 'gym',
    healthFlag: 'none',
    ...overrides,
  }
}

describe('calculatePlan — BMR (Mifflin-St Jeor)', () => {
  it('applies the male offset (+5)', () => {
    const profile = makeProfile({ gender: 'male', age: 30, heightCm: 180, currentWeightKg: 80 })
    const result = calculatePlan(profile)
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(result.bmr).toBe(1780)
  })

  it('applies the female offset (-161)', () => {
    const profile = makeProfile({ gender: 'female', age: 30, heightCm: 180, currentWeightKg: 80 })
    const result = calculatePlan(profile)
    // 10*80 + 6.25*180 - 5*30 - 161 = 800 + 1125 - 150 - 161 = 1614
    expect(result.bmr).toBe(1614)
  })

  it('uses a midpoint offset when gender is undisclosed', () => {
    const profile = makeProfile({ gender: 'undisclosed', age: 30, heightCm: 180, currentWeightKg: 80 })
    const result = calculatePlan(profile)
    // 10*80 + 6.25*180 - 5*30 - 78 = 800 + 1125 - 150 - 78 = 1697
    expect(result.bmr).toBe(1697)
  })
})

describe('calculatePlan — TDEE activity multiplier', () => {
  it('increases TDEE as days-available increases, holding BMR constant', () => {
    const base = makeProfile({ daysAvailable: 3, experience: 'intermediate' })
    const more = makeProfile({ daysAvailable: 7, experience: 'intermediate' })
    expect(calculatePlan(more).tdee).toBeGreaterThan(calculatePlan(base).tdee)
  })

  it('nudges TDEE up for advanced vs beginner experience at the same days-available', () => {
    const beginner = makeProfile({ daysAvailable: 5, experience: 'beginner' })
    const advanced = makeProfile({ daysAvailable: 5, experience: 'advanced' })
    expect(calculatePlan(advanced).tdee).toBeGreaterThan(calculatePlan(beginner).tdee)
  })
})

describe('calculatePlan — calorie targets by goal', () => {
  it('applies a calorie deficit for weight-loss', () => {
    const result = calculatePlan(makeProfile({ goal: 'weight-loss' }))
    expect(result.calorieDelta).toBeLessThan(0)
    expect(result.targetCalories).toBe(result.tdee + result.calorieDelta)
  })

  it('applies a calorie surplus for bulking', () => {
    const result = calculatePlan(makeProfile({ goal: 'bulking' }))
    expect(result.calorieDelta).toBeGreaterThan(0)
  })

  it('applies the largest deficit for shredding', () => {
    const cutting = calculatePlan(makeProfile({ goal: 'cutting' }))
    const shredding = calculatePlan(makeProfile({ goal: 'shredding' }))
    expect(shredding.calorieDelta).toBeLessThan(cutting.calorieDelta)
  })
})

describe('calculatePlan — macros', () => {
  it('scales protein directly with bodyweight', () => {
    const lighter = calculatePlan(makeProfile({ currentWeightKg: 60, goal: 'cutting' }))
    const heavier = calculatePlan(makeProfile({ currentWeightKg: 100, goal: 'cutting' }))
    expect(heavier.macros.protein).toBeGreaterThan(lighter.macros.protein)
  })

  it('produces macro calories that roughly reconstruct the target calories', () => {
    const result = calculatePlan(makeProfile({ goal: 'bulking' }))
    const reconstructed =
      result.macros.protein * 4 + result.macros.carbs * 4 + result.macros.fats * 9
    // carbs are the rounded remainder, so allow a small rounding tolerance
    expect(Math.abs(reconstructed - result.targetCalories)).toBeLessThanOrEqual(4)
  })

  it('never returns negative carbs even for an aggressive deficit', () => {
    const result = calculatePlan(makeProfile({ goal: 'shredding', currentWeightKg: 50, heightCm: 150, age: 60 }))
    expect(result.macros.carbs).toBeGreaterThanOrEqual(0)
  })
})

describe('calculatePlan — BMI', () => {
  it('computes BMI from height and current weight', () => {
    const result = calculatePlan(makeProfile({ heightCm: 180, currentWeightKg: 80 }))
    // 80 / 1.8^2 = 24.69...
    expect(result.bmi).toBeCloseTo(24.7, 1)
  })
})

describe('goalLabel', () => {
  it('returns a human-readable label for each goal', () => {
    expect(goalLabel('weight-loss')).toContain('Weight Loss')
    expect(goalLabel('bulking')).toContain('Bulking')
    expect(goalLabel('cutting')).toContain('Cutting')
    expect(goalLabel('shredding')).toContain('Shredding')
  })
})
