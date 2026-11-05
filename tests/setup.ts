import dotenv from 'dotenv'
import { afterAll, vi } from 'vitest'

dotenv.config({ path: '.env.test', override: true, quiet: true })

vi.mock('../src/Utils/sendEmail.js', () => ({
  emailEnabled: () => false,
  sendContactNotification: vi.fn(async () => true),
}))

afterAll(async () => {
  const { pool } = await import('../src/db/index.js')
  await pool.end()
})
