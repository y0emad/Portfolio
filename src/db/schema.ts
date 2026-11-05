import { relations } from 'drizzle-orm'
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
  primaryKey,
  jsonb,
} from 'drizzle-orm/pg-core'

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
  designPreview?: string
  screenshots?: Screenshot[]
}

export const skillCategoryEnum = pgEnum('skill_category', ['frontend', 'backend', 'database', 'devops', 'tools'])

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  summary: text('summary').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  repoUrl: text('repo_url').notNull(),
  liveUrl: text('live_url'),
  coverUrl: text('cover_url'),
  caseStudy: jsonb('case_study').$type<CaseStudy>(),
  featured: boolean('featured').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  category: skillCategoryEnum('category').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export const projectSkills = pgTable(
  'project_skills',
  {
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => skills.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.skillId] })],
)

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  read: boolean('read').notNull().default(false),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})
export type Project = typeof projects.$inferSelect
export type NewProject = typeof projects.$inferInsert
export type Skill = typeof skills.$inferSelect
export type NewSkill = typeof skills.$inferInsert
export type Message = typeof messages.$inferSelect
export type NewMessage = typeof messages.$inferInsert

export const projectsRelations = relations(projects, ({ many }) => ({
  projectSkills: many(projectSkills),
}))

export const skillsRelations = relations(skills, ({ many }) => ({
  projectSkills: many(projectSkills),
}))

export const projectSkillsRelations = relations(projectSkills, ({ one }) => ({
  project: one(projects, {
    fields: [projectSkills.projectId],
    references: [projects.id],
  }),
  skill: one(skills, {
    fields: [projectSkills.skillId],
    references: [skills.id],
  }),
}))
