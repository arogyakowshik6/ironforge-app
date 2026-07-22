import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthedRequest } from '../middleware/auth'
import { assignMembershipSchema } from '../validation'

const router = Router()

// Public — plan catalogue.
router.get('/plans', async (_req, res) => {
  const plans = await prisma.membershipPlan.findMany({ orderBy: { priceCents: 'asc' } })
  res.json(plans)
})

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const membership = await prisma.membership.findFirst({
    where: { userId: req.userId!, status: 'active' },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(membership)
})

// No frontend calls this yet, and there's no payment provider behind it —
// it just records the membership as "active" directly. Wire up a real
// checkout flow (Stripe etc.) before using this for anything real.
router.post('/me', requireAuth, async (req: AuthedRequest, res) => {
  const parsed = assignMembershipSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() })

  const plan = await prisma.membershipPlan.findUnique({ where: { id: parsed.data.planId } })
  if (!plan) return res.status(404).json({ error: 'Plan not found' })

  const membership = await prisma.membership.create({
    data: { userId: req.userId!, planId: plan.id, status: 'active' },
    include: { plan: true },
  })
  res.status(201).json(membership)
})

export default router
