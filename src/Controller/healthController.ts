import type { Request, Response } from 'express'
import { sql } from 'drizzle-orm'
import { db } from '../db/index.js'

const STARTED_AT = new Date()
const DB_TIMEOUT_MS = 2000

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Database timeout')), ms)),
  ])
}

export async function getHealth(_req: Request, res: Response) {
  const base = {
    uptime: Math.round(process.uptime()),
    startedAt: STARTED_AT.toISOString(),
    deploy: { commit: process.env.GIT_SHA ?? null, deployedAt: process.env.DEPLOYED_AT ?? null },
  }

  const start = performance.now()
  try {
    await withTimeout(db.execute(sql`SELECT 1`), DB_TIMEOUT_MS)
    const latencyMs = Math.round((performance.now() - start) * 10) / 10

    res.json({ success: true, status: 'ok', database: { status: 'ok', latencyMs }, ...base })
  } catch (err) {
    console.error('Health check: database unavailable', err)
    res.status(503).json({ success: false, status: 'degraded', database: { status: 'down', latencyMs: null }, ...base })
  }
}
