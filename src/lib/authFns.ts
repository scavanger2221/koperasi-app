import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'
import { verifyPassword } from './auth'
import { signPayload, verifyPayload } from './session.server'

export const login = createServerFn({ method: 'POST' })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = await db.query.users.findFirst({
      where: eq(users.username, data.username),
    })
    if (!user) {
      throw new Error('Username atau password salah')
    }
    const valid = await verifyPassword(data.password, user.passwordHash)
    if (!valid) {
      throw new Error('Username atau password salah')
    }
    const token = signPayload({
      userId: user.id,
      username: user.username,
      role: user.role,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    })
    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    }
  })

export const getMe = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const payload = verifyPayload(data.token)
    if (!payload) {
      throw new Error('Sesi tidak valid')
    }
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId),
    })
    if (!user) {
      throw new Error('Pengguna tidak ditemukan')
    }
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    }
  })
