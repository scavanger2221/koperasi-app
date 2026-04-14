import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import { hashPassword } from '../lib/auth'

const sqlite = new Database('./data.sqlite')
const db = drizzle(sqlite, { schema })

async function seed() {
  // Default admin user
  const adminPassword = await hashPassword('admin123')
  await db.insert(schema.users).values({
    username: 'admin',
    passwordHash: adminPassword,
    name: 'Administrator',
    role: 'admin',
  }).onConflictDoNothing()

  // Default teller
  const tellerPassword = await hashPassword('teller123')
  await db.insert(schema.users).values({
    username: 'teller',
    passwordHash: tellerPassword,
    name: 'Teller',
    role: 'teller',
  }).onConflictDoNothing()

  // Default jenis simpanan
  await db.insert(schema.jenisSimpanan).values([
    { code: 'POKOK', name: 'Simpanan Pokok', isMandatory: true },
    { code: 'WAJIB', name: 'Simpanan Wajib', isMandatory: true },
    { code: 'SUKARELA', name: 'Simpanan Sukarela', isMandatory: false },
  ]).onConflictDoNothing()

  // Default jenis pinjaman
  await db.insert(schema.jenisPinjaman).values([
    { code: 'USAHARAKYAT', name: 'Pinjaman Usaha Rakyat', interestRate: 12, tenorMonths: 12, description: 'Pinjaman usaha dengan bunga 12% per tahun' },
    { code: 'MIKRO', name: 'Pinjaman Mikro', interestRate: 18, tenorMonths: 6, description: 'Pinjaman mikro dengan bunga 18% per tahun' },
  ]).onConflictDoNothing()

  // Default settings
  await db.insert(schema.settings).values([
    { key: 'coop_name', value: 'Koperasi Simpan Pinjam Sejahtera' },
    { key: 'coop_address', value: '-' },
    { key: 'late_fee_rate', value: '1' }, // 1% per month late fee
  ]).onConflictDoNothing()

  console.log('Seeded successfully')
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
