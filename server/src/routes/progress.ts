import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import { toggleSchema } from '../validation'

const router = Router()
router.use(requireAuth)

// Returns { [exerciseId]: true } for every exercise the user has logged done,
// keyed by exercise id rather than the day/session/index composite the old
// localStorage map used — the frontend adapter translates between the two.
router.get('/', async (req: AuthedRequest, res) => {
  const logs = await prisma.exerciseLog.findMany({
    where: { userId: req.userId!, completed: true },
    select: { exerciseId: true },
  })
  res.json({ completedExerciseIds: logs.map((l: { exerciseId: string }) => l.exerciseId) })
})

router.put('/toggle', async (req: AuthedRequest, res) => {
  const parsed = toggleSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }
  const { exerciseId, completed } = parsed.data

  const exercise = await prisma.exercise.findUnique({ where: { id: exerciseId } })
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' })

  if (completed) {
    const log = await prisma.exerciseLog.upsert({
      where: { userId_exerciseId: { userId: req.userId!, exerciseId } },
      create: { userId: req.userId!, exerciseId, completed: true },
      update: { completed: true, completedAt: new Date() },
    })
    return res.json(log)
  }

  await prisma.exerciseLog
    .delete({ where: { userId_exerciseId: { userId: req.userId!, exerciseId } } })
    .catch(() => null) // already not logged — treat as success
  res.json({ exerciseId, completed: false })
})

export default router
