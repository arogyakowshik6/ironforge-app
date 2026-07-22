import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// Public — this mirrors the same static content the frontend already bundles;
// exposed here mainly so Exercise rows have stable ids for ExerciseLog to
// reference, and so the schema matches the issue's requested shape.
router.get('/:goalKey', async (req, res) => {
  const workouts = await prisma.workout.findMany({
    where: { goalKey: req.params.goalKey },
    orderBy: { day: 'asc' },
    include: { exercises: { orderBy: [{ sessionIndex: 'asc' }, { exerciseIndex: 'asc' }] } },
  })
  if (workouts.length === 0) return res.status(404).json({ error: 'Unknown goal' })
  res.json(workouts)
})

export default router
