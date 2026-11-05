import { execFileSync } from 'node:child_process'
import dotenv from 'dotenv'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'

export async function setup() {
  dotenv.config({ path: '.env.test', override: true, quiet: true })
  const url = new URL(process.env.DATABASE_URL!)
  const dbName = url.pathname.slice(1)

  const adminUrl = new URL(url)
  adminUrl.pathname = '/postgres'
  const admin = new pg.Client({ connectionString: adminUrl.toString() })
  await admin.connect()
  const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName])
  if (!rowCount) await admin.query(`CREATE DATABASE "${dbName}"`)
  await admin.end()

  const pool = new pg.Pool({ connectionString: url.toString() })
  await migrate(drizzle(pool), { migrationsFolder: './drizzle' })
  await pool.end()

  execFileSync(process.execPath, ['--import', 'tsx', 'src/db/seed.ts'], {
    env: { ...process.env, DATABASE_URL: url.toString() },
    stdio: 'ignore',
  })
}
