// Integration tests — these hit a real Postgres database through the actual
// Express app + Prisma client, unlike validation.test.ts / auth.test.ts which
// are pure unit tests with no DB dependency.
//
// Requires:
//   1. A running Postgres reachable via DATABASE_URL (see server/.env)
//   2. `npx prisma generate` to have been run (creates the Prisma Client)
//   3. Migrations applied: `npx prisma migrate deploy`
//
// Run with: npm run test:integration
//
// NOTE: these were authored and reviewed carefully but could not be executed
// in the sandbox this project was built in — that environment can reach a
// local Postgres (verified separately, see server/README.md) but cannot
// reach binaries.prisma.sh to generate the Prisma Client. Run these yourself
// once you have the client generated; the schema itself (migration.sql) was
// verified against a live Postgres instance.

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { createApp } from '../src/app'
import { prisma } from '../src/lib/prisma'

const app = createApp()

const testUser = {
  email: `test-${Date.now()}@ironforge.dev`,
  password: 'testpassword123',
  name: 'Test User',
}

let token: string

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } })
  await prisma.$disconnect()
})

describe('auth flow', () => {
  it('registers a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)
    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe(testUser.email)
    token = res.body.token
  })

  it('rejects duplicate registration', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)
    expect(res.status).toBe(409)
  })

  it('logs in with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrong-password' })
    expect(res.status).toBe(401)
  })

  it('returns the current user for a valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.email).toBe(testUser.email)
  })

  it('rejects /me with no token', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(401)
  })
})

describe('profile CRUD', () => {
  const profile = {
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

  it('rejects unauthenticated access', async () => {
    const res = await request(app).get('/api/profile')
    expect(res.status).toBe(401)
  })

  it('returns 404 before any profile is set', async () => {
    const res = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(404)
  })

  it('creates a profile via upsert', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send(profile)
    expect(res.status).toBe(200)
    expect(res.body.goal).toBe('weight-loss')
  })

  it('retrieves the persisted profile', async () => {
    const res = await request(app).get('/api/profile').set('Authorization', `Bearer ${token}`)
    expect(res.status).toBe(200)
    expect(res.body.currentWeightKg).toBe(80)
  })

  it('updates the profile via a second upsert', async () => {
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...profile, goal: 'bulking' })
    expect(res.status).toBe(200)
    expect(res.body.goal).toBe('bulking')
  })
})

describe('workouts (public, seeded content)', () => {
  it('returns seeded workouts for a known goal', async () => {
    const res = await request(app).get('/api/workouts/weight-loss')
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBe(7) // 7-day programme
  })

  it('returns 404 for an unknown goal', async () => {
    const res = await request(app).get('/api/workouts/not-a-real-goal')
    expect(res.status).toBe(404)
  })
})

describe('exercise progress toggle', () => {
  it('toggles an exercise done, then not done', async () => {
    const workouts = await request(app).get('/api/workouts/weight-loss')
    const firstExercise = workouts.body[0].exercises[0]

    const on = await request(app)
      .put('/api/progress/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ exerciseId: firstExercise.id, completed: true })
    expect(on.status).toBe(200)

    const list = await request(app).get('/api/progress').set('Authorization', `Bearer ${token}`)
    expect(list.body.completedExerciseIds).toContain(firstExercise.id)

    const off = await request(app)
      .put('/api/progress/toggle')
      .set('Authorization', `Bearer ${token}`)
      .send({ exerciseId: firstExercise.id, completed: false })
    expect(off.status).toBe(200)

    const list2 = await request(app).get('/api/progress').set('Authorization', `Bearer ${token}`)
    expect(list2.body.completedExerciseIds).not.toContain(firstExercise.id)
  })
})

describe('memberships', () => {
  it('lists the seeded plan catalogue', async () => {
    const res = await request(app).get('/api/memberships/plans')
    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('assigns a membership to the current user', async () => {
    const plans = await request(app).get('/api/memberships/plans')
    const planId = plans.body[0].id

    const res = await request(app)
      .post('/api/memberships/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId })
    expect(res.status).toBe(201)
    expect(res.body.status).toBe('active')
  })
})
