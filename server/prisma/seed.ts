import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from '../src/lib/prisma'
import programmesData from './seed-data/programmes.json'

interface SeedExercise {
  name: string
  prescription: string
  description: string
}
interface SeedSession {
  label: string | null
  exercises: SeedExercise[]
}
interface SeedDay {
  day: number
  dayName: string
  title: string
  isRestDay: boolean
  sessions: SeedSession[]
}
interface SeedProgramme {
  key: string
  days: SeedDay[]
}

async function seedWorkouts() {
  const programmes = (programmesData as { programmes: SeedProgramme[] }).programmes

  for (const programme of programmes) {
    for (const day of programme.days) {
      const workout = await prisma.workout.upsert({
        where: { goalKey_day: { goalKey: programme.key, day: day.day } },
        create: {
          goalKey: programme.key,
          day: day.day,
          dayName: day.dayName,
          title: day.title,
          isRestDay: day.isRestDay,
        },
        update: {
          dayName: day.dayName,
          title: day.title,
          isRestDay: day.isRestDay,
        },
      })

      for (let si = 0; si < day.sessions.length; si++) {
        const session = day.sessions[si]
        for (let ei = 0; ei < session.exercises.length; ei++) {
          const ex = session.exercises[ei]
          await prisma.exercise.upsert({
            where: {
              workoutId_sessionIndex_exerciseIndex: {
                workoutId: workout.id,
                sessionIndex: si,
                exerciseIndex: ei,
              },
            },
            create: {
              workoutId: workout.id,
              sessionIndex: si,
              sessionLabel: session.label,
              exerciseIndex: ei,
              name: ex.name,
              prescription: ex.prescription,
              description: ex.description,
            },
            update: {
              sessionLabel: session.label,
              name: ex.name,
              prescription: ex.prescription,
              description: ex.description,
            },
          })
        }
      }
    }
  }

  const workoutCount = await prisma.workout.count()
  const exerciseCount = await prisma.exercise.count()
  console.log(`Seeded ${workoutCount} workouts, ${exerciseCount} exercises across ${programmes.length} programmes.`)
}

async function seedMembershipPlans() {
  const plans = [
    { name: 'Basic', description: 'Gym floor access, standard hours.', priceCents: 2999, billingInterval: 'monthly' },
    { name: 'Pro', description: 'Full access + classes + guest passes.', priceCents: 4999, billingInterval: 'monthly' },
    { name: 'Annual Pro', description: 'Pro tier, billed yearly (2 months free).', priceCents: 49999, billingInterval: 'yearly' },
  ]

  for (const plan of plans) {
    const existing = await prisma.membershipPlan.findFirst({ where: { name: plan.name } })
    if (!existing) {
      await prisma.membershipPlan.create({ data: plan })
    }
  }
  console.log(`Seeded ${plans.length} membership plans.`)
}

async function seedAdminUser() {
  const email = 'admin@ironforge.dev'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('Admin user already exists, skipping.')
    return
  }
  const passwordHash = await bcrypt.hash('changeme123', 10)
  await prisma.user.create({
    data: { email, passwordHash, name: 'Admin' },
  })
  console.log(`Seeded admin user (${email} / changeme123 — change this immediately in any real deployment).`)
}

async function main() {
  await seedAdminUser()
  await seedMembershipPlans()
  await seedWorkouts()
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
