import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import { profileSchema } from '../validation'

const router = Router()
router.use(requireAuth)

router.get('/', async (req: AuthedRequest, res) => {
  const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } })
  if (!profile) return res.status(404).json({ error: 'No profile yet' })
  res.json(profile)
})

// Upsert — the onboarding wizard calls this once on submit, and again
// whenever the user redoes it.
router.put('/', async (req: AuthedRequest, res) => {
  const parsed = profileSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() })
  }
  const profile = await prisma.profile.upsert({
    where: { userId: req.userId! },
    create: { userId: req.userId!, ...parsed.data },
    update: { ...parsed.data },
  })
  res.json(profile)
})

export default router
