import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { simpanan, pinjaman, angsuran } from '../db/schema'
import { eq, and, gte, lte, lt } from 'drizzle-orm'
import { withAuth } from './authUtils'

export const reportSimpanan = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; from: number; to: number }) => data)
  .handler(withAuth(async (data) => {
    const rows = await db.query.simpanan.findMany({
      where: and(gte(simpanan.date, new Date(data.from)), lte(simpanan.date, new Date(data.to))),
      with: { member: true, jenis: true },
      orderBy: simpanan.date,
    })
    const totalDeposit = rows.filter((r) => r.type === 'deposit').reduce((s, r) => s + r.amount, 0)
    const totalWithdrawal = rows.filter((r) => r.type === 'withdrawal').reduce((s, r) => s + r.amount, 0)
    return { rows, totalDeposit, totalWithdrawal, net: totalDeposit - totalWithdrawal }
  }))

export const reportPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; from: number; to: number; status?: string }) => data)
  .handler(withAuth(async (data) => {
    const rows = await db.query.pinjaman.findMany({
      where: and(
        gte(pinjaman.applicationDate, new Date(data.from)),
        lte(pinjaman.applicationDate, new Date(data.to)),
        data.status ? eq(pinjaman.status, data.status as any) : undefined
      ),
      with: { member: true, jenis: true },
      orderBy: pinjaman.applicationDate,
    })
    const totalPrincipal = rows.reduce((s, r) => s + r.principal, 0)
    const totalInterest = rows.reduce((s, r) => s + r.totalInterest, 0)
    return { rows, totalPrincipal, totalInterest }
  }))

export const reportAngsuran = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; from: number; to: number }) => data)
  .handler(withAuth(async (data) => {
    const rows = await db.query.angsuran.findMany({
      where: and(gte(angsuran.paidDate, new Date(data.from)), lte(angsuran.paidDate, new Date(data.to))),
      with: { pinjaman: { with: { member: true } } },
      orderBy: angsuran.paidDate,
    })
    const totalPaid = rows.reduce((s, r) => s + r.paidAmount, 0)
    const totalPenalty = rows.reduce((s, r) => s + r.penaltyAmount, 0)
    return { rows, totalPaid, totalPenalty }
  }))

export const reportTunggakan = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string }) => data)
  .handler(withAuth(async (_data) => {
    const today = new Date().getTime()
    const rows = await db.query.angsuran.findMany({
      where: and(eq(angsuran.status, 'unpaid'), lt(angsuran.dueDate, new Date(today))),
      with: { pinjaman: { with: { member: true } } },
      orderBy: angsuran.dueDate,
    })
    const totalDue = rows.reduce((s, r) => s + r.totalAmount, 0)
    return { rows, totalDue, count: rows.length }
  }))
