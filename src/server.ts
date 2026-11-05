import 'dotenv/config'
import app from './app.js'
import { sql } from 'drizzle-orm'
import { db, pool } from './db/index.js'
import { emailEnabled } from './Utils/sendEmail.js'

const PORT = process.env.PORT || 3001

async function start() {
  try {
    await db.execute(sql`SELECT 1`)
    console.log(' Database connected')
    console.log(
      emailEnabled()
        ? ' Contact emails: on (Brevo)'
        : ' Contact emails: off (set BREVO_API_KEY, EMAIL_FROM and CONTACT_NOTIFY_EMAIL to turn them on)',
    )
    app.listen(PORT, () => console.log(` Server started on port ${PORT}`))
  } catch (err) {
    console.error(' Database connection failed:', err)
    process.exit(1)
  }
}

process.on('SIGINT', async () => {
  await pool.end()
  process.exit(0)
})

start()
