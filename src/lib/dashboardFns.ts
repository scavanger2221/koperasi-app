import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { members, simpanan, pinjaman, angsuran } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { startOfDay, subMonths, format } from 'date-fns'
import { verifyPayload } from './session.server'

function verifyToken(data: { token: string }) {
  const payload = verifyPayload(data.token)
  if (!payload) throw new Error('Sesi tidak valid')
  return payload
}

export const getDashboardStats = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)

    const today = startOfDay(new Date()).getTime()

    const [memberCount] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(members)
      .where(eq(members.status, 'active'))

    const [totalSimpanan] = await db
      .select({ total: sql<number>`sum(case when ${simpanan.type} = 'deposit' then ${simpanan.amount} else -${simpanan.amount} end)`.mapWith(Number) })
      .from(simpanan)

    const [totalPinjaman] = await db
      .select({ total: sql<number>`sum(${pinjaman.principal})`.mapWith(Number) })
      .from(pinjaman)
      .where(eq(pinjaman.status, 'disbursed'))

    const [totalAngsuranHariIni] = await db
      .select({ total: sql<number>`sum(${angsuran.paidAmount})`.mapWith(Number) })
      .from(angsuran)
      .where(sql`${angsuran.paidDate} >= ${today}`)

    const [tunggakanCount] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(angsuran)
      .where(and(eq(angsuran.status, 'unpaid'), sql`${angsuran.dueDate} < ${today}`))

    return {
      activeMembers: memberCount?.count || 0,
      totalSimpanan: totalSimpanan?.total || 0,
      totalPinjaman: totalPinjaman?.total || 0,
      angsuranHariIni: totalAngsuranHariIni?.total || 0,
      tunggakan: tunggakanCount?.count || 0,
    }
  })

export const getDashboardChartData = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)

    const months: { label: string; simpanan: number; pinjaman: number }[] = []

    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i)
      const year = d.getFullYear()
      const month = d.getMonth() + 1
      const label = format(d, 'MMM')

      const start = new Date(year, month - 1, 1).getTime()
      const end = new Date(year, month, 0, 23, 59, 59, 999).getTime()

      const [simpRow] = await db
        .select({
          total: sql<number>`sum(case when ${simpanan.type} = 'deposit' then ${simpanan.amount} else -${simpanan.amount} end)`.mapWith(Number),
        })
        .from(simpanan)
        .where(and(sql`${simpanan.date} >= ${start}`, sql`${simpanan.date} <= ${end}`))

      const [pinjRow] = await db
        .select({ total: sql<number>`sum(${pinjaman.principal})`.mapWith(Number) })
        .from(pinjaman)
        .where(and(eq(pinjaman.status, 'disbursed'), sql`${pinjaman.applicationDate} >= ${start}`, sql`${pinjaman.applicationDate} <= ${end}`))

      months.push({
        label,
        simpanan: simpRow?.total || 0,
        pinjaman: pinjRow?.total || 0,
      })
    }

    return months
  })
