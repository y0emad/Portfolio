import request from 'supertest'
import { describe, expect, it } from 'vitest'
import app from '../src/app.js'

describe('GET /api/projects', () => {
  it('returns every project in order, each with its skills as names', async () => {
    const res = await request(app).get('/api/projects')

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.projects.length).toBeGreaterThan(0)

    const orders = res.body.projects.map((p: { sortOrder: number }) => p.sortOrder)
    expect(orders).toEqual([...orders].sort((a, b) => a - b))

    const first = res.body.projects[0]
    expect(first.skills.every((s: unknown) => typeof s === 'string')).toBe(true)
    expect(first).not.toHaveProperty('projectSkills')
  })

  it('has exactly one featured project', async () => {
    const res = await request(app).get('/api/projects')
    const featured = res.body.projects.filter((p: { featured: boolean }) => p.featured)
    expect(featured).toHaveLength(1)
  })
})

describe('GET /api/projects/:slug', () => {
  it('returns one project with its case study', async () => {
    const res = await request(app).get('/api/projects/clinicflow')

    expect(res.status).toBe(200)
    expect(res.body.project.slug).toBe('clinicflow')
    expect(res.body.project.skills).toContain('PostgreSQL')
    expect(res.body.project.caseStudy.layers.length).toBeGreaterThan(0)
  })

  it('returns 404 for a slug that does not exist', async () => {
    const res = await request(app).get('/api/projects/not-a-real-project')

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ success: false, msg: 'Project not found' })
  })
})

describe('GET /api/skills', () => {
  it('groups skills by category', async () => {
    const res = await request(app).get('/api/skills')

    expect(res.status).toBe(200)
    expect(Object.keys(res.body.skills)).toEqual(expect.arrayContaining(['frontend', 'backend', 'database']))
    for (const [category, list] of Object.entries(res.body.skills as Record<string, { category: string }[]>)) {
      expect(list.every((s) => s.category === category)).toBe(true)
    }
  })
})
