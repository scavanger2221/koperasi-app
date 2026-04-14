import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10
export const SESSION_COOKIE_NAME = 'koperasi_session'
export const SESSION_SECRET = process.env.SESSION_SECRET || 'koperasi-dev-secret-change-in-production'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
