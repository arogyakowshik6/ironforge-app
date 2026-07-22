import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, type AuthedRequest } from '../middleware/auth'

const router = Router()
router.use(requireAuth)

// Read-only. Nothing writes to PaymentRecord yet — there's no payment
// provider wired up (see server/README.md "Known gaps"). This exists so the
// schema matches the issue's requested shape and is ready for that work.
router.get('/', async (req: AuthedRequest, res) => {
  const records = await prisma.paymentRecord.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' },
  })
  res.json(records)
})

export default router
