import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { members, jenisSimpanan, simpanan } from '../db/schema'
import { eq, and, desc, sql, like } from 'drizzle-orm'
import { withAuth } from './authUtils'
import type { SimpananType } from '../constants/status'

export const listJenisSimpanan = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string }) => data)
  .handler(withAuth(async (_data) => {
    return db.query.jenisSimpanan.findMany({ orderBy: jenisSimpanan.id })
  }))

export const listSimpanan = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; memberId?: number; search?: string }) => data)
  .handler(withAuth(async (data) => {
    const rows = await db
      .select({
        id: simpanan.id,
        memberId: simpanan.memberId,
        jenisSimpananId: simpanan.jenisSimpananId,
        type: simpanan.type,
        amount: simpanan.amount,
        date: simpanan.date,
        notes: simpanan.notes,
        createdAt: simpanan.createdAt,
        member: {
          id: members.id,
          code: members.code,
          name: members.name,
          nik: members.nik,
          phone: members.phone,
          address: members.address,
          status: members.status,
          createdAt: members.createdAt,
          updatedAt: members.updatedAt,
        },
        jenis: {
          id: jenisSimpanan.id,
          name: jenisSimpanan.name,
          description: jenisSimpanan.description,
        },
      })
      .from(simpanan)
      .innerJoin(members, eq(simpanan.memberId, members.id))
      .innerJoin(jenisSimpanan, eq(simpanan.jenisSimpananId, jenisSimpanan.id))
      .where(and(
        data.memberId ? eq(simpanan.memberId, data.memberId) : undefined,
        data.search ? like(members.name, `%${data.search}%`) : undefined
      ))
      .orderBy(desc(simpanan.date))
      .limit(200)
    return rows as any
  }))

export const getMemberSimpananBalance = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; memberId: number; jenisSimpananId?: number }) => data)
  .handler(withAuth(async (data) => {
    const rows = await db
      .select({
        jenisId: simpanan.jenisSimpananId,
        name: jenisSimpanan.name,
        total: sql<number>`sum(case when ${simpanan.type} = 'deposit' then ${simpanan.amount} else -${simpanan.amount} end)`.mapWith(Number),
      })
      .from(simpanan)
      .innerJoin(jenisSimpanan, eq(simpanan.jenisSimpananId, jenisSimpanan.id))
      .where(and(
        eq(simpanan.memberId, data.memberId),
        data.jenisSimpananId ? eq(simpanan.jenisSimpananId, data.jenisSimpananId) : undefined
      ))
      .groupBy(simpanan.jenisSimpananId, jenisSimpanan.name)
    return rows
  }))

export const createSimpanan = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; memberId: number; jenisSimpananId: number; type: SimpananType; amount: number; date: string; notes?: string }) => data)
  .handler(withAuth(async (data) => {
    const amount = Math.abs(data.amount)
    if (amount <= 0) throw new Error('Jumlah harus lebih dari 0')

    if (data.type === 'withdrawal') {
      const [balanceRow] = await db
        .select({ total: sql<number>`sum(case when ${simpanan.type} = 'deposit' then ${simpanan.amount} else -${simpanan.amount} end)`.mapWith(Number) })
        .from(simpanan)
        .where(and(
          eq(simpanan.memberId, data.memberId),
          eq(simpanan.jenisSimpananId, data.jenisSimpananId)
        ))
      const balance = balanceRow?.total || 0
      if (balance < amount) throw new Error('Saldo tidak mencukupi untuk penarikan')
    }

    const [trx] = await db.insert(simpanan).values({
      memberId: data.memberId,
      jenisSimpananId: data.jenisSimpananId,
      type: data.type,
      amount,
      date: new Date(data.date),
      notes: data.notes || null,
      createdBy: undefined,
    }).returning()
    return trx
  }))
