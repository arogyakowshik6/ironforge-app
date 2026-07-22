import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  loginSchema,
  profileSchema,
  toggleSchema,
  assignMembershipSchema,
} from '../src/validation'

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', password: 'longenough', name: 'Sam' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid email', () => {
    const result = registerSchema.safeParse({ email: 'not-an-email', password: 'longenough', name: 'Sam' })
    expect(result.success).toBe(false)
  })

  it('rejects a short password', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', password: 'short', name: 'Sam' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty name', () => {
    const result = registerSchema.safeParse({ email: 'a@b.com', password: 'longenough', name: '' })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts email + non-empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true)
  })

  it('rejects an empty password', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false)
  })
})

describe('profileSchema', () => {
  const valid = {
    age: 28,
    gender: 'male',
    heightCm: 180,
    currentWeightKg: 80,
    targetWeightKg: 75,
    bodyType: 'mesomorph',
    experience: 'beginner',
    goal: 'weight-loss',
    daysAvailable: 4,
    equipment: 'gym',
    healthFlag: 'none',
  }

  it('accepts a fully valid profile matching the onboarding wizard shape', () => {
    expect(profileSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects an out-of-range age', () => {
    expect(profileSchema.safeParse({ ...valid, age: 5 }).success).toBe(false)
    expect(profileSchema.safeParse({ ...valid, age: 150 }).success).toBe(false)
  })

  it('rejects an unknown goal', () => {
    expect(profileSchema.safeParse({ ...valid, goal: 'get-swole' }).success).toBe(false)
  })

  it('rejects daysAvailable outside 1-7', () => {
    expect(profileSchema.safeParse({ ...valid, daysAvailable: 0 }).success).toBe(false)
    expect(profileSchema.safeParse({ ...valid, daysAvailable: 8 }).success).toBe(false)
  })

  it('rejects non-positive height/weight', () => {
    expect(profileSchema.safeParse({ ...valid, heightCm: -5 }).success).toBe(false)
    expect(profileSchema.safeParse({ ...valid, currentWeightKg: 0 }).success).toBe(false)
  })
})

describe('toggleSchema', () => {
  it('accepts a valid exercise toggle', () => {
    const result = toggleSchema.safeParse({
      exerciseId: '123e4567-e89b-12d3-a456-426614174000',
      completed: true,
    })
    expect(result.success).toBe(true)
  })

  it('rejects a non-uuid exerciseId', () => {
    expect(toggleSchema.safeParse({ exerciseId: 'not-a-uuid', completed: true }).success).toBe(false)
  })
})

describe('assignMembershipSchema', () => {
  it('accepts a valid plan id', () => {
    expect(
      assignMembershipSchema.safeParse({ planId: '123e4567-e89b-12d3-a456-426614174000' }).success
    ).toBe(true)
  })

  it('rejects a missing planId', () => {
    expect(assignMembershipSchema.safeParse({}).success).toBe(false)
  })
})
