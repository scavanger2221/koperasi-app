import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { members, jenisPinjaman, pinjaman, angsuran } from '../db/schema'
import { eq, and, desc, like } from 'drizzle-orm'
import { withAuth } from './authUtils'
import { addMonths } from 'date-fns'
import type { PinjamanStatus } from '../constants/status'
import { calculateFlatInterest } from './calculations'

export const listJenisPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string }) => data)
  .handler(withAuth(async (_data) => {
    return db.query.jenisPinjaman.findMany({ orderBy: jenisPinjaman.id })
  }))

export const listPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; memberId?: number; status?: PinjamanStatus; search?: string }) => data)
  .handler(withAuth(async (data) => {
    const rows = await db
      .select({
        id: pinjaman.id,
        memberId: pinjaman.memberId,
        jenisPinjamanId: pinjaman.jenisPinjamanId,
        principal: pinjaman.principal,
        interestRate: pinjaman.interestRate,
        tenorMonths: pinjaman.tenorMonths,
        totalInterest: pinjaman.totalInterest,
        totalPayment: pinjaman.totalPayment,
        installmentAmount: pinjaman.installmentAmount,
        applicationDate: pinjaman.applicationDate,
        disbursementDate: pinjaman.disbursementDate,
        status: pinjaman.status,
        notes: pinjaman.notes,
        createdAt: pinjaman.createdAt,
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
          id: jenisPinjaman.id,
          name: jenisPinjaman.name,
          interestRate: jenisPinjaman.interestRate,
          description: jenisPinjaman.description,
        },
      })
      .from(pinjaman)
      .innerJoin(members, eq(pinjaman.memberId, members.id))
      .innerJoin(jenisPinjaman, eq(pinjaman.jenisPinjamanId, jenisPinjaman.id))
      .where(and(
        data.memberId ? eq(pinjaman.memberId, data.memberId) : undefined,
        data.status ? eq(pinjaman.status, data.status as any) : undefined,
        data.search ? like(members.name, `%${data.search}%`) : undefined
      ))
      .orderBy(desc(pinjaman.createdAt))
      .limit(200)
    return rows as any
  }))

export const getPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number }) => data)
  .handler(withAuth(async (data) => {
    const p = await db.query.pinjaman.findFirst({
      where: eq(pinjaman.id, data.id),
      with: { member: true, jenis: true, angsuran: { orderBy: angsuran.installmentNumber } },
    })
    if (!p) throw new Error('Pinjaman tidak ditemukan')
    return p
  }))

// Flat interest calculation (bunga flat)
export const createPinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; memberId: number; jenisPinjamanId: number; principal: number; tenorMonths: number; applicationDate: string; notes?: string }) => data)
  .handler(withAuth(async (data) => {
    const jenis = await db.query.jenisPinjaman.findFirst({
      where: eq(jenisPinjaman.id, data.jenisPinjamanId),
    })
    if (!jenis) throw new Error('Jenis pinjaman tidak ditemukan')

    const principal = Math.abs(data.principal)
    const tenor = Math.abs(data.tenorMonths)
    if (principal <= 0 || tenor <= 0) throw new Error('Pokok dan tenor harus lebih dari 0')

    const interestRate = jenis.interestRate
    const { totalInterest, totalPayment, installmentAmount } = calculateFlatInterest(principal, interestRate, tenor)
    const monthlyPrincipal = principal / tenor
    const monthlyInterest = totalInterest / tenor

    let createdPinjaman: any
    db.transaction((tx) => {
      const [p] = tx.insert(pinjaman).values({
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
      }).returning().all()

      createdPinjaman = p

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
      tx.insert(angsuran).values(angsuranData).run()
    })

    // Re-fetch with relations to return complete object
    const result = await db.query.pinjaman.findFirst({
      where: eq(pinjaman.id, createdPinjaman.id),
      with: { member: true, jenis: true },
    })
    return result as any
  }))

export const approvePinjaman = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number }) => data)
  .handler(withAuth(async (data) => {
    const [p] = await db
      .update(pinjaman)
      .set({ status: 'disbursed', disbursementDate: new Date() })
      .where(eq(pinjaman.id, data.id))
      .returning()
    return p
  }))
