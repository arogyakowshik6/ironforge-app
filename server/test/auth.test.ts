import { describe, it, expect, vi } from 'vitest'
import type { Response, NextFunction } from 'express'
import { signToken, requireAuth, type AuthedRequest } from '../src/middleware/auth'

function mockRes() {
  const res: Partial<Response> = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res as Response
}

describe('signToken / requireAuth round trip', () => {
  it('produces a token that requireAuth accepts and attaches userId from', () => {
    const token = signToken('user-123')
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthedRequest
    const res = mockRes()
    const next = vi.fn() as NextFunction

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.userId).toBe('user-123')
    expect(res.status).not.toHaveBeenCalled()
  })

  it('rejects a request with no Authorization header', () => {
    const req = { headers: {} } as AuthedRequest
    const res = mockRes()
    const next = vi.fn() as NextFunction

    requireAuth(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rejects a malformed Authorization header (missing "Bearer ")', () => {
    const req = { headers: { authorization: 'not-bearer-token' } } as AuthedRequest
    const res = mockRes()
    const next = vi.fn() as NextFunction

    requireAuth(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
  })

  it('rejects a token signed with a different secret', () => {
    // simulate a forged/foreign token by tampering with a valid one
    const token = signToken('user-123')
    const tampered = token.slice(0, -2) + 'xx'
    const req = { headers: { authorization: `Bearer ${tampered}` } } as AuthedRequest
    const res = mockRes()
    const next = vi.fn() as NextFunction

    requireAuth(req, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(res.status).toHaveBeenCalledWith(401)
  })
})
