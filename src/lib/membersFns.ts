import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { members } from '../db/schema'
import { eq, like, or, desc } from 'drizzle-orm'
import { withAuth } from './authUtils'
import type { MemberStatus } from '../constants/status'

export const listMembers = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; search?: string }) => data)
  .handler(withAuth(async (data) => {
    const query = db.query.members.findMany({
      where: data.search
        ? or(
            like(members.name, `%${data.search}%`),
            like(members.code, `%${data.search}%`),
            like(members.nik, `%${data.search}%`)
          )
        : undefined,
      orderBy: [desc(members.createdAt)],
    })
    return query
  }))

export const getMember = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number }) => data)
  .handler(withAuth(async (data) => {
    const member = await db.query.members.findFirst({
      where: eq(members.id, data.id),
    })
    if (!member) throw new Error('Anggota tidak ditemukan')
    return member
  }))

export const createMember = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; code: string; name: string; nik?: string; address?: string; phone?: string }) => data)
  .handler(withAuth(async (data) => {
    const existing = await db.query.members.findFirst({
      where: eq(members.code, data.code),
    })
    if (existing) throw new Error('Kode anggota sudah digunakan')
    const [member] = await db
      .insert(members)
      .values({
        code: data.code,
        name: data.name,
        nik: data.nik || null,
        address: data.address || null,
        phone: data.phone || null,
      })
      .returning()
    return member
  }))

export const updateMember = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number; name?: string; nik?: string; address?: string; phone?: string; status?: MemberStatus }) => data)
  .handler(withAuth(async (data) => {
    const [member] = await db
      .update(members)
      .set({
        name: data.name,
        nik: data.nik,
        address: data.address,
        phone: data.phone,
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(members.id, data.id))
      .returning()
    if (!member) throw new Error('Anggota tidak ditemukan')
    return member
  }))

export const deactivateMember = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number }) => data)
  .handler(withAuth(async (data) => {
    const [member] = await db
      .update(members)
      .set({ status: 'inactive', updatedAt: new Date() })
      .where(eq(members.id, data.id))
      .returning()
    if (!member) throw new Error('Anggota tidak ditemukan')
    return member
  }))
