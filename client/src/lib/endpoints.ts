export type Method = 'GET' | 'POST'

export type Endpoint = {
  id: string
  method: Method
  path: string
  title: string
  description: string
  slugParam?: boolean
  defaultBody?: Record<string, string>
}

export const ENDPOINTS: Endpoint[] = [
  {
    id: 'projects',
    method: 'GET',
    path: '/api/projects',
    title: 'List projects',
    description: 'Every project on this site with its skills, in the order shown on the home page.',
  },
  {
    id: 'project',
    method: 'GET',
    path: '/api/projects/:slug',
    title: 'Get one project',
    description: 'One project with its full case study. Returns 404 when the slug does not exist.',
    slugParam: true,
  },
  {
    id: 'skills',
    method: 'GET',
    path: '/api/skills',
    title: 'List skills',
    description: 'All skills, grouped by category (frontend, backend, database, devops, tools).',
  },
  {
    id: 'deploys',
    method: 'GET',
    path: '/api/deploys',
    title: 'Recent deploys',
    description: 'The latest commits of this site, read from GitHub and cached for 10 minutes.',
  },
  {
    id: 'health',
    method: 'GET',
    path: '/health',
    title: 'Health check',
    description: 'Is the server up and can it reach the database? Returns 503 when the database is down.',
  },
  {
    id: 'contact',
    method: 'POST',
    path: '/api/contact',
    title: 'Send a message',
    description:
      'Validates the body with express-validator, saves it and emails me. Rate limited to 5 requests every 10 minutes.',
    defaultBody: {
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      body: 'Hi Yousef, I tried your API from the explorer.',
    },
  },
]

export const METHOD_STYLE: Record<Method, string> = {
  GET: 'text-accent',
  POST: 'text-warn',
}
