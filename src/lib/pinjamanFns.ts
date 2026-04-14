import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { jenisPinjaman, pinjaman, angsuran } from '../db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { verifyPayload } from './session.server'
import { addMonths } from 'date-fns'

function verifyToken(data: { token: string }) {
  const payload = verifyPayload(data.token)
  if (!payload) throw new Error('Sesi tidak valid')
  return payload
}

export const listJenisPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    return db.query.jenisPinjaman.findMany({ orderBy: jenisPinjaman.id })
  })

export const listPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; memberId?: number; status?: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    return db.query.pinjaman.findMany({
      where: and(
        data.memberId ? eq(pinjaman.memberId, data.memberId) : undefined,
        data.status ? eq(pinjaman.status, data.status as any) : undefined
      ),
      with: { member: true, jenis: true },
      orderBy: [desc(pinjaman.createdAt)],
      limit: 200,
    })
  })

export const getPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const p = await db.query.pinjaman.findFirst({
      where: eq(pinjaman.id, data.id),
      with: { member: true, jenis: true, angsuran: { orderBy: angsuran.installmentNumber } },
    })
    if (!p) throw new Error('Pinjaman tidak ditemukan')
    return p
  })

// Flat interest calculation (bunga flat)
export const createPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; memberId: number; jenisPinjamanId: number; principal: number; tenorMonths: number; applicationDate: string; notes?: string }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const jenis = await db.query.jenisPinjaman.findFirst({
      where: eq(jenisPinjaman.id, data.jenisPinjamanId),
    })
    if (!jenis) throw new Error('Jenis pinjaman tidak ditemukan')

    const principal = Math.abs(data.principal)
    const tenor = Math.abs(data.tenorMonths)
    if (principal <= 0 || tenor <= 0) throw new Error('Pokok dan tenor harus lebih dari 0')

    const interestRate = jenis.interestRate
    const totalInterest = principal * (interestRate / 100) * (tenor / 12)
    const totalPayment = principal + totalInterest
    const installmentAmount = totalPayment / tenor
    const monthlyPrincipal = principal / tenor
    const monthlyInterest = totalInterest / tenor

    const [p] = await db.insert(pinjaman).values({
      memberId: data.memberId,
      jenisPinjamanId: data.jenisPinjamanId,
      principal,
      interestRate,
      tenorMonths: tenor,
      totalInterest,
      totalPayment,
      installmentAmount,
      applicationDate: new Date(data.applicationDate),
      status: 'approved',
      notes: data.notes || null,
    }).returning()

    // Generate angsuran schedule
    const baseDate = new Date(data.applicationDate)
    const angsuranData = Array.from({ length: tenor }, (_, i) => {
      const dueDate = addMonths(baseDate, i + 1)
      return {
        pinjamanId: p.id,
        installmentNumber: i + 1,
        dueDate,
        principalAmount: monthlyPrincipal,
        interestAmount: monthlyInterest,
        totalAmount: installmentAmount,
      }
    })
    await db.insert(angsuran).values(angsuranData)

    return p
  })

export const approvePinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number }) => data)
  .handler(async ({ data }) => {
    verifyToken(data)
    const [p] = await db
      .update(pinjaman)
      .set({ status: 'disbursed', disbursementDate: new Date() })
      .where(eq(pinjaman.id, data.id))
      .returning()
    return p
  })
