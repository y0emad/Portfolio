import type { Request, Response } from 'express'
import { asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { skills } from '../db/schema.js'

export async function getSkills(_req: Request, res: Response) {
  const allSkills = await db.query.skills.findMany({ orderBy: asc(skills.sortOrder) })
  res.json({ success: true, skills: Object.groupBy(allSkills, (s) => s.category) })
}
