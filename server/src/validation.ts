import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const profileSchema = z.object({
  age: z.number().int().min(13).max(100),
  gender: z.enum(['male', 'female', 'undisclosed']),
  heightCm: z.number().positive(),
  currentWeightKg: z.number().positive(),
  targetWeightKg: z.number().positive(),
  bodyType: z.enum(['ectomorph', 'mesomorph', 'endomorph']),
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  goal: z.enum(['weight-loss', 'bulking', 'cutting', 'shredding']),
  daysAvailable: z.number().int().min(1).max(7),
  equipment: z.enum(['home', 'gym', 'both']),
  healthFlag: z.enum(['none', 'injury', 'medical']),
})

export const toggleSchema = z.object({
  exerciseId: z.string().uuid(),
  completed: z.boolean(),
})

export const assignMembershipSchema = z.object({
  planId: z.string().uuid(),
})
