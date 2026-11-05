import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '../src/app.js'

describe('GET /health', () => {
  it('reports the API and the database as ok', async () => {
    const res = await request(app).get('/health')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, status: 'ok', database: { status: 'ok' } })
    expect(typeof res.body.database.latencyMs).toBe('number')
    expect(typeof res.body.uptime).toBe('number')
    expect(new Date(res.body.startedAt).toString()).not.toBe('Invalid Date')
  })
})

describe('GET /api/deploys', () => {
  it('returns an empty list when no GitHub repo is set', async () => {
    const res = await request(app).get('/api/deploys')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, deploys: [] })
  })
})

describe('unknown routes', () => {
  it('returns a JSON 404 under /api', async () => {
    const res = await request(app).get('/api/nothing-here')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, msg: 'Route GET /api/nothing-here not found' })
  })

  it('sends the security headers', async () => {
    const res = await request(app).get('/health')

    expect(res.headers['x-powered-by']).toBeUndefined()
    expect(res.headers['content-security-policy']).toContain("frame-src 'self' https://embed.figma.com")
  })
})
