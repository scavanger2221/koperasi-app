import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { pinjaman, angsuran, settings } from '../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { verifyPayload } from './session.server'
import { differenceInDays } from 'date-fns'

function verifyToken(data: { token: string }) {
  const payload = verifyPayload(data.token)
  if (!payload) throw new Error('Sesi tidak valid')
  return payload
}

export const listAngsuran = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; pinjamanId?: number; status?: string; memberName?: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const rows = await db.query.angsuran.findMany({
      where: and(
        data.pinjamanId ? eq(angsuran.pinjamanId, data.pinjamanId) : undefined,
        data.status ? eq(angsuran.status, data.status as any) : undefined
      ),
      with: { pinjaman: { with: { member: true } } },
      orderBy: [desc(angsuran.dueDate)],
      limit: 300,
    })
    if (data.memberName) {
      return rows.filter((r) => r.pinjaman?.member?.name.toLowerCase().includes(data.memberName!.toLowerCase()))
    }
    return rows
  })

export const getAngsuran = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const a = await db.query.angsuran.findFirst({
      where: eq(angsuran.id, data.id),
      with: { pinjaman: { with: { member: true } } },
    })
    if (!a) throw new Error('Angsuran tidak ditemukan')
    return a
  })

export const payAngsuran = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number; paidAmount: number; paidDate: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const a = await db.query.angsuran.findFirst({ where: eq(angsuran.id, data.id) })
    if (!a) throw new Error('Angsuran tidak ditemukan')

    const paidAmount = Math.abs(data.paidAmount)
    const paidDate = new Date(data.paidDate)
    const dueDate = new Date(a.dueDate)

    const lateDays = paidDate > dueDate ? Math.max(0, differenceInDays(paidDate, dueDate)) : 0

    // Get late fee rate from settings (default 1% per month of total amount)
    const setting = await db.query.settings.findFirst({ where: eq(settings.key, 'late_fee_rate') })
    const lateFeeRate = Number(setting?.value || 1) / 100
    const penaltyAmount = lateDays > 0 ? Math.round(a.totalAmount * lateFeeRate * (lateDays / 30)) : 0

    const totalDue = a.totalAmount + penaltyAmount
    const newPaidAmount = a.paidAmount + paidAmount

    let status: 'unpaid' | 'paid' | 'partial' = 'unpaid'
    if (newPaidAmount >= totalDue) status = 'paid'
    else if (newPaidAmount > 0) status = 'partial'

    const [updated] = await db
      .update(angsuran)
      .set({
        paidAmount: newPaidAmount,
        paidDate,
        lateDays,
        penaltyAmount,
        status,
      })
      .where(eq(angsuran.id, data.id))
      .returning()

    // If all angsuran paid, mark pinjaman as paid
    if (status === 'paid') {
      const unpaidCount = await db
        .select({ count: sql<number>`count(*)`.mapWith(Number) })
        .from(angsuran)
        .where(and(eq(angsuran.pinjamanId, a.pinjamanId), eq(angsuran.status, 'unpaid')))
      const remaining = unpaidCount[0]?.count || 0
      if (remaining === 0) {
        await db.update(pinjaman).set({ status: 'paid' }).where(eq(pinjaman.id, a.pinjamanId))
      }
    }

    return updated
  })
