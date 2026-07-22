import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth'
import profileRoutes from './routes/profile'
import progressRoutes from './routes/progress'
import workoutRoutes from './routes/workouts'
import membershipRoutes from './routes/memberships'
import paymentRoutes from './routes/payments'

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  app.use('/api/auth', authRoutes)
  app.use('/api/profile', profileRoutes)
  app.use('/api/progress', progressRoutes)
  app.use('/api/workouts', workoutRoutes)
  app.use('/api/memberships', membershipRoutes)
  app.use('/api/payments', paymentRoutes)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  })

  return app
}
