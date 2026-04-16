import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/client.server'
import { members, pinjaman, angsuran, settings } from '../db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { withAuth } from './authUtils'
import { differenceInDays } from 'date-fns'
import type { AngsuranStatus, PinjamanStatus } from '../constants/status'
import { calculateLateFee } from './calculations'

export const listAngsuran = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; pinjamanId?: number; status?: AngsuranStatus; memberName?: string }) => data)
  .handler(withAuth(async (data) => {
    const rows = await db
      .select({
        // angsuran
        a_id: angsuran.id,
        a_pinjamanId: angsuran.pinjamanId,
        a_installmentNumber: angsuran.installmentNumber,
        a_dueDate: angsuran.dueDate,
        a_principalAmount: angsuran.principalAmount,
        a_interestAmount: angsuran.interestAmount,
        a_totalAmount: angsuran.totalAmount,
        a_paidAmount: angsuran.paidAmount,
        a_paidDate: angsuran.paidDate,
        a_lateDays: angsuran.lateDays,
        a_penaltyAmount: angsuran.penaltyAmount,
        a_status: angsuran.status,
        a_createdAt: angsuran.createdAt,
        // pinjaman
        p_id: pinjaman.id,
        p_memberId: pinjaman.memberId,
        p_jenisPinjamanId: pinjaman.jenisPinjamanId,
        p_principal: pinjaman.principal,
        p_interestRate: pinjaman.interestRate,
        p_tenorMonths: pinjaman.tenorMonths,
        p_totalInterest: pinjaman.totalInterest,
        p_totalPayment: pinjaman.totalPayment,
        p_installmentAmount: pinjaman.installmentAmount,
        p_applicationDate: pinjaman.applicationDate,
        p_disbursementDate: pinjaman.disbursementDate,
        p_status: pinjaman.status,
        p_notes: pinjaman.notes,
        p_createdAt: pinjaman.createdAt,
        // member
        m_id: members.id,
        m_code: members.code,
        m_name: members.name,
        m_nik: members.nik,
        m_phone: members.phone,
        m_address: members.address,
        m_status: members.status,
        m_createdAt: members.createdAt,
        m_updatedAt: members.updatedAt,
      })
      .from(angsuran)
      .innerJoin(pinjaman, eq(angsuran.pinjamanId, pinjaman.id))
      .innerJoin(members, eq(pinjaman.memberId, members.id))
      .where(and(
        data.pinjamanId ? eq(angsuran.pinjamanId, data.pinjamanId) : undefined,
        data.status ? eq(angsuran.status, data.status as any) : undefined,
        data.memberName ? sql`lower(${members.name}) like ${`%${data.memberName.toLowerCase()}%`}` : undefined
      ))
      .orderBy(desc(angsuran.dueDate))
      .limit(300)

    const mapped = rows.map((r) => ({
      id: r.a_id,
      pinjamanId: r.a_pinjamanId,
      installmentNumber: r.a_installmentNumber,
      dueDate: r.a_dueDate,
      principalAmount: r.a_principalAmount,
      interestAmount: r.a_interestAmount,
      totalAmount: r.a_totalAmount,
      paidAmount: r.a_paidAmount,
      paidDate: r.a_paidDate,
      lateDays: r.a_lateDays,
      penaltyAmount: r.a_penaltyAmount,
      status: r.a_status,
      createdAt: r.a_createdAt,
      pinjaman: {
        id: r.p_id,
        memberId: r.p_memberId,
        jenisPinjamanId: r.p_jenisPinjamanId,
        principal: r.p_principal,
        interestRate: r.p_interestRate,
        tenorMonths: r.p_tenorMonths,
        totalInterest: r.p_totalInterest,
        totalPayment: r.p_totalPayment,
        installmentAmount: r.p_installmentAmount,
        applicationDate: r.p_applicationDate,
        disbursementDate: r.p_disbursementDate,
        status: r.p_status,
        notes: r.p_notes,
        createdAt: r.p_createdAt,
        member: {
          id: r.m_id,
          code: r.m_code,
          name: r.m_name,
          nik: r.m_nik,
          phone: r.m_phone,
          address: r.m_address,
          status: r.m_status,
          createdAt: r.m_createdAt,
          updatedAt: r.m_updatedAt,
        },
      },
    }))

    return mapped as any
  }))

export const getAngsuran = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number }) => data)
  .handler(withAuth(async (data) => {
    const a = await db.query.angsuran.findFirst({
      where: eq(angsuran.id, data.id),
      with: { pinjaman: { with: { member: true } } },
    })
    if (!a) throw new Error('Angsuran tidak ditemukan')
    return a
  }))

export const payAngsuran = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string; id: number; paidAmount: number; paidDate: string }) => data)
  .handler(withAuth(async (data) => {
    let updated: any
    db.transaction((tx) => {
      // Read current angsuran with lock
      const aRows = tx.select().from(angsuran).where(eq(angsuran.id, data.id)).all()
      const a = aRows[0]
      if (!a) throw new Error('Angsuran tidak ditemukan')

      const paidAmount = Math.abs(data.paidAmount)
      const paidDate = new Date(data.paidDate)
      const dueDate = new Date(a.dueDate)

      const lateDays = paidDate > dueDate ? Math.max(0, differenceInDays(paidDate, dueDate)) : 0

      // Get late fee rate from settings (default 1% per month of total amount)
      const settingRows = tx.select().from(settings).where(eq(settings.key, 'late_fee_rate')).all()
      const setting = settingRows[0]
      const lateFeeRate = Number(setting?.value || 1) / 100
      const penaltyAmount = calculateLateFee(a.totalAmount, lateDays, lateFeeRate * 100)

      const totalDue = a.totalAmount + penaltyAmount
      const newPaidAmount = a.paidAmount + paidAmount

      let status: AngsuranStatus = 'unpaid'
      if (newPaidAmount >= totalDue) status = 'paid'
      else if (newPaidAmount > 0) status = 'partial'

      const [result] = tx
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
        .all()

      updated = result

      // If all angsuran paid, mark pinjaman as paid (within same transaction)
      if (status === 'paid') {
        const unpaidCount = tx
          .select({ count: sql<number>`count(*)`.mapWith(Number) })
          .from(angsuran)
          .where(and(eq(angsuran.pinjamanId, a.pinjamanId), eq(angsuran.status, 'unpaid')))
          .all()
        const remaining = unpaidCount[0]?.count || 0
        if (remaining === 0) {
          tx.update(pinjaman).set({ status: 'paid' as PinjamanStatus }).where(eq(pinjaman.id, a.pinjamanId)).run()
        }
      }
    })

    return updated
  }))
