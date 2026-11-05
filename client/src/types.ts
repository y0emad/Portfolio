export type CaseStudyLayer = {
  name: string
  tech: string
  title: string
  problem: string
  decision: string
}

export type Screenshot = {
  src: string
  alt: string
  caption: string
  mobile?: boolean
}

export type CaseStudy = {
  role: string
  deploy: string
  layers: CaseStudyLayer[]
  results: string[]
  designUrl?: string
  screenshots?: Screenshot[]
}

export type Project = {
  id: string
  slug: string
  title: string
  summary: string
  body: string
  repoUrl: string
  liveUrl: string | null
  coverUrl: string | null
  caseStudy: CaseStudy | null
  featured: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  skills: string[]
}

export type SkillCategory = 'frontend' | 'backend' | 'database' | 'devops' | 'tools'

export type Skill = {
  id: string
  name: string
  category: SkillCategory
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type ProjectsResponse = { success: boolean; projects: Project[] }
export type ProjectResponse = { success: boolean; project: Project }
export type SkillsResponse = { success: boolean; skills: Partial<Record<SkillCategory, Skill[]>> }

export type Health = {
  success: boolean
  status: 'ok' | 'degraded'
  database: { status: 'ok' | 'down'; latencyMs: number | null }
  uptime: number
  startedAt: string
  deploy: { commit: string | null; deployedAt: string | null }
}

export type Deploy = { sha: string; message: string; date: string; url: string }
export type DeploysResponse = { success: boolean; deploys: Deploy[] }
