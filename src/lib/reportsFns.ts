import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { simpanan, pinjaman, angsuran } from '../db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { verifyPayload } from './session.server'

function verifyToken(data: { token: string }) {
  const payload = verifyPayload(data.token)
  if (!payload) throw new Error('Sesi tidak valid')
  return payload
}

export const reportSimpanan = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; from: string; to: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const from = Math.floor(new Date(data.from).getTime() / 1000)
    const to = Math.floor(new Date(data.to).getTime() / 1000)
    const rows = await db.query.simpanan.findMany({
      where: sql`${simpanan.date} >= ${from} AND ${simpanan.date} <= ${to}`,
      with: { member: true, jenis: true },
      orderBy: simpanan.date,
    })
    const totalDeposit = rows.filter((r) => r.type === 'deposit').reduce((s, r) => s + r.amount, 0)
    const totalWithdrawal = rows.filter((r) => r.type === 'withdrawal').reduce((s, r) => s + r.amount, 0)
    return { rows, totalDeposit, totalWithdrawal, net: totalDeposit - totalWithdrawal }
  })

export const reportPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; from: string; to: string; status?: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const from = Math.floor(new Date(data.from).getTime() / 1000)
    const to = Math.floor(new Date(data.to).getTime() / 1000)
    const rows = await db.query.pinjaman.findMany({
      where: and(
        sql`${pinjaman.applicationDate} >= ${from} AND ${pinjaman.applicationDate} <= ${to}`,
        data.status ? eq(pinjaman.status, data.status as any) : undefined
      ),
      with: { member: true, jenis: true },
      orderBy: pinjaman.applicationDate,
    })
    const totalPrincipal = rows.reduce((s, r) => s + r.principal, 0)
    const totalInterest = rows.reduce((s, r) => s + r.totalInterest, 0)
    return { rows, totalPrincipal, totalInterest }
  })

export const reportAngsuran = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; from: string; to: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const from = Math.floor(new Date(data.from).getTime() / 1000)
    const to = Math.floor(new Date(data.to).getTime() / 1000)
    const rows = await db.query.angsuran.findMany({
      where: sql`${angsuran.paidDate} >= ${from} AND ${angsuran.paidDate} <= ${to}`,
      with: { pinjaman: { with: { member: true } } },
      orderBy: angsuran.paidDate,
    })
    const totalPaid = rows.reduce((s, r) => s + r.paidAmount, 0)
    const totalPenalty = rows.reduce((s, r) => s + r.penaltyAmount, 0)
    return { rows, totalPaid, totalPenalty }
  })

export const reportTunggakan = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const today = Math.floor(new Date().getTime() / 1000)
    const rows = await db.query.angsuran.findMany({
      where: and(eq(angsuran.status, 'unpaid'), sql`${angsuran.dueDate} < ${today}`),
      with: { pinjaman: { with: { member: true } } },
      orderBy: angsuran.dueDate,
    })
    const totalDue = rows.reduce((s, r) => s + r.totalAmount, 0)
    return { rows, totalDue, count: rows.length }
  })
