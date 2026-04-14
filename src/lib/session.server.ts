import { createHmac, timingSafeEqual } from 'crypto'
import { SESSION_SECRET } from './auth'

export interface SessionPayload {
  userId: number
  username: string
  role: string
  exp: number
}

function signPayload(payload: SessionPayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = createHmac('sha256', SESSION_SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

function verifyPayload(token: string): SessionPayload | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [data, sig] = parts
  const expectedSig = createHmac('sha256', SESSION_SECRET).update(data).digest('base64url')
  if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as SessionPayload
    if (Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export { signPayload, verifyPayload }
