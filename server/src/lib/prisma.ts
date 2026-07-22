import { PrismaClient } from '@prisma/client'

// Reuse a single client across hot-reloads / requests instead of opening a
// new connection pool per import.
export const prisma = new PrismaClient()
