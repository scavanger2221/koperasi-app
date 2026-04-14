import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'
import { relations } from 'drizzle-orm'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', { enum: ['admin', 'teller'] }).notNull().default('teller'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const members = sqliteTable('members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  nik: text('nik').unique(),
  address: text('address'),
  phone: text('phone'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const jenisSimpanan = sqliteTable('jenis_simpanan', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isMandatory: integer('is_mandatory', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const simpanan = sqliteTable('simpanan', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'restrict' }),
  jenisSimpananId: integer('jenis_simpanan_id').notNull().references(() => jenisSimpanan.id, { onDelete: 'restrict' }),
  type: text('type', { enum: ['deposit', 'withdrawal'] }).notNull(),
  amount: real('amount').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const jenisPinjaman = sqliteTable('jenis_pinjaman', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  interestRate: real('interest_rate').notNull(),
  tenorMonths: integer('tenor_months'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const pinjaman = sqliteTable('pinjaman', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  memberId: integer('member_id').notNull().references(() => members.id, { onDelete: 'restrict' }),
  jenisPinjamanId: integer('jenis_pinjaman_id').notNull().references(() => jenisPinjaman.id, { onDelete: 'restrict' }),
  principal: real('principal').notNull(),
  interestRate: real('interest_rate').notNull(),
  tenorMonths: integer('tenor_months').notNull(),
  totalInterest: real('total_interest').notNull(),
  totalPayment: real('total_payment').notNull(),
  installmentAmount: real('installment_amount').notNull(),
  applicationDate: integer('application_date', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  approvalDate: integer('approval_date', { mode: 'timestamp' }),
  disbursementDate: integer('disbursement_date', { mode: 'timestamp' }),
  status: text('status', { enum: ['pending', 'approved', 'disbursed', 'paid'] }).notNull().default('pending'),
  notes: text('notes'),
  createdBy: integer('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const angsuran = sqliteTable('angsuran', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pinjamanId: integer('pinjaman_id').notNull().references(() => pinjaman.id, { onDelete: 'cascade' }),
  installmentNumber: integer('installment_number').notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }).notNull(),
  principalAmount: real('principal_amount').notNull(),
  interestAmount: real('interest_amount').notNull(),
  totalAmount: real('total_amount').notNull(),
  paidAmount: real('paid_amount').notNull().default(0),
  paidDate: integer('paid_date', { mode: 'timestamp' }),
  lateDays: integer('late_days').notNull().default(0),
  penaltyAmount: real('penalty_amount').notNull().default(0),
  status: text('status', { enum: ['unpaid', 'paid', 'partial'] }).notNull().default('unpaid'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
  value: text('value'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Relations
export const membersRelations = relations(members, ({ many }) => ({
  simpanan: many(simpanan),
  pinjaman: many(pinjaman),
}))

export const jenisSimpananRelations = relations(jenisSimpanan, ({ many }) => ({
  simpanan: many(simpanan),
}))

export const simpananRelations = relations(simpanan, ({ one }) => ({
  member: one(members, { fields: [simpanan.memberId], references: [members.id] }),
  jenis: one(jenisSimpanan, { fields: [simpanan.jenisSimpananId], references: [jenisSimpanan.id] }),
  creator: one(users, { fields: [simpanan.createdBy], references: [users.id] }),
}))

export const jenisPinjamanRelations = relations(jenisPinjaman, ({ many }) => ({
  pinjaman: many(pinjaman),
}))

export const pinjamanRelations = relations(pinjaman, ({ one, many }) => ({
  member: one(members, { fields: [pinjaman.memberId], references: [members.id] }),
  jenis: one(jenisPinjaman, { fields: [pinjaman.jenisPinjamanId], references: [jenisPinjaman.id] }),
  creator: one(users, { fields: [pinjaman.createdBy], references: [users.id] }),
  angsuran: many(angsuran),
}))

export const angsuranRelations = relations(angsuran, ({ one }) => ({
  pinjaman: one(pinjaman, { fields: [angsuran.pinjamanId], references: [pinjaman.id] }),
}))
