import request from 'supertest'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it, vi } from 'vitest'
import app from '../src/app.js'
import { db } from '../src/db/index.js'
import { messages } from '../src/db/schema.js'
import { sendContactNotification } from '../src/Utils/sendEmail.js'

const EMAIL = 'test.visitor@example.com'
const valid = { name: 'Test Visitor', email: EMAIL, body: 'Hello, this is a message from the tests.' }

afterEach(async () => {
  await db.delete(messages).where(eq(messages.email, EMAIL))
})

describe('POST /api/contact', () => {
  it('saves the message, sends the notification and returns 201', async () => {
    const res = await request(app).post('/api/contact').send(valid)

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ success: true, notified: true })

    const rows = await db.select().from(messages).where(eq(messages.email, EMAIL))
    expect(rows).toHaveLength(1)
    expect(rows[0].name).toBe('Test Visitor')
    expect(sendContactNotification).toHaveBeenCalledOnce()
  })

  it('trims the fields and normalizes the email', async () => {
    await request(app)
      .post('/api/contact')
      .send({ ...valid, name: '  Test Visitor  ', email: '  Test.Visitor@Example.com ' })
      .expect(201)

    const rows = await db.select().from(messages).where(eq(messages.email, EMAIL))
    expect(rows[0].name).toBe('Test Visitor')
  })

  it('still returns 201 when the notification email fails', async () => {
    vi.mocked(sendContactNotification).mockResolvedValueOnce(false)

    const res = await request(app).post('/api/contact').send(valid)

    expect(res.status).toBe(201)
    expect(res.body.notified).toBe(false)
  })

  it.each([
    [{ ...valid, name: 'A' }, 'Name must be between 2 and 100 characters'],
    [{ ...valid, email: 'not-an-email' }, 'Please provide a valid email address'],
    [{ ...valid, body: 'short' }, 'Message must be between 10 and 2000 characters'],
    [{ ...valid, website: 'spam.example' }, 'Spam detected'],
  ])('rejects an invalid body with 400 (%#)', async (body, msg) => {
    const res = await request(app).post('/api/contact').send(body)

    expect(res.status).toBe(400)
    expect(res.body).toEqual({ success: false, msg })
    expect(await db.select().from(messages).where(eq(messages.email, EMAIL))).toHaveLength(0)
  })

  it('with ?dryRun=true validates but saves and sends nothing', async () => {
    const res = await request(app).post('/api/contact?dryRun=true').send(valid)

    expect(res.status).toBe(200)
    expect(res.body.dryRun).toBe(true)
    expect(await db.select().from(messages).where(eq(messages.email, EMAIL))).toHaveLength(0)
    expect(sendContactNotification).not.toHaveBeenCalled()
  })

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app).post('/api/contact').set('Content-Type', 'application/json').send('{"name":')

    expect(res.status).toBe(400)
    expect(res.body.msg).toBe('Invalid JSON body')
  })
})
