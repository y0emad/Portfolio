import type { Request, Response } from 'express'
import { asc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { projects, type Project, type Skill } from '../db/schema.js'
import { AppError } from '../Utils/AppError.js'

const withSkills = { projectSkills: { with: { skill: true } } } as const

function toProjectDto({ projectSkills, ...project }: Project & { projectSkills: { skill: Skill }[] }) {
  return { ...project, skills: projectSkills.map((ps) => ps.skill.name) }
}

export async function getProjects(_req: Request, res: Response) {
  const rows = await db.query.projects.findMany({
    orderBy: asc(projects.sortOrder),
    with: withSkills,
  })
  res.json({ success: true, projects: rows.map(toProjectDto) })
}

export async function getSlug(req: Request<{ slug: string }>, res: Response) {
  const project = await db.query.projects.findFirst({
    where: (p, { eq }) => eq(p.slug, req.params.slug),
    with: withSkills,
  })
  if (!project) throw new AppError(404, 'Project not found')

  res.json({ success: true, project: toProjectDto(project) })
}
