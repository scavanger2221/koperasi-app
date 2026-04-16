import { verifyPayload } from './session.server'
import type { SessionPayload } from './session.server'

export function verifyToken(data: { token: string }) {
  const payload = verifyPayload(data.token)
  if (!payload) throw new Error('Sesi tidak valid')
  return payload
}

export function withAuth<T extends { token: string }, R>(
  handler: (data: T, user: SessionPayload) => R | Promise<R>
) {
  return async ({ data }: { data: T }): Promise<R> => {
    const user = verifyToken(data)
    return handler(data, user)
  }
}
