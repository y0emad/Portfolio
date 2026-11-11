import 'dotenv/config'
import { db, pool } from './index.js'
import { CASE_STUDIES } from './caseStudies.js'
import { projects, projectSkills, skills, type NewProject } from './schema.js'

const SKILLS: { name: string; category: 'frontend' | 'backend' | 'database' | 'devops' | 'tools' }[] = [
  { name: 'React', category: 'frontend' },
  { name: 'TypeScript', category: 'frontend' },
  { name: 'JavaScript', category: 'frontend' },
  { name: 'React Query', category: 'frontend' },
  { name: 'React Router', category: 'frontend' },
  { name: 'Tailwind CSS', category: 'frontend' },
  { name: 'Ant Design', category: 'frontend' },
  { name: 'Material UI', category: 'frontend' },
  { name: 'Vite', category: 'frontend' },
  { name: 'Three.js', category: 'frontend' },
  { name: 'HTML & CSS', category: 'frontend' },
  { name: 'Node.js', category: 'backend' },
  { name: 'Express', category: 'backend' },
  { name: 'REST APIs', category: 'backend' },
  { name: 'JWT', category: 'backend' },
  { name: 'Drizzle ORM', category: 'backend' },
  { name: 'Mongoose', category: 'backend' },
  { name: 'FastAPI', category: 'backend' },
  { name: 'Python', category: 'backend' },
  { name: 'GraphQL', category: 'backend' },
  { name: 'PostgreSQL', category: 'database' },
  { name: 'MongoDB', category: 'database' },
  { name: 'MySQL', category: 'database' },
  { name: 'Redis', category: 'database' },
  { name: 'Docker', category: 'devops' },
  { name: 'GitHub Actions', category: 'devops' },
  { name: 'AWS', category: 'devops' },
  { name: 'Caddy', category: 'devops' },
  { name: 'Temporal', category: 'devops' },
  { name: 'Apache Kafka', category: 'devops' },
  { name: 'Vitest', category: 'tools' },
  { name: 'Jest', category: 'tools' },
  { name: 'Supertest', category: 'tools' },
  { name: 'Playwright', category: 'tools' },
  { name: 'Git', category: 'tools' },
  { name: 'Postman', category: 'tools' },
  { name: 'Figma', category: 'tools' },
]

const PROJECTS: (NewProject & { skills: string[] })[] = [
  {
    slug: 'clinicflow',
    title: 'ClinicFlow',
    summary:
      'A booking app for a single-doctor clinic, live on AWS with Docker, HTTPS and a CI/CD pipeline. Double booking is blocked in the database itself.',
    body:
      'Patients pick a service, a day and a free time slot. The doctor manages services, working hours, days off and appointments from a dashboard.\n\n' +
      'Double booking is blocked by a PostgreSQL exclusion constraint on appointment time ranges, so two patients booking the same slot at the same moment get one confirmation and one clear 409. ' +
      'Free slots are generated in clinic time (Africa/Cairo, with daylight saving) by one function shared by the availability page and the booking endpoint.\n\n' +
      'The React front end uses Ant Design, Tailwind CSS and React Query, with Arabic (RTL) and dark mode. 30 integration tests run against a real PostgreSQL database on every pull request, ' +
      'and every merge to main publishes a new Docker image that the EC2 server picks up on its own.',
    repoUrl: 'https://github.com/y0emad/Clinic-Flow',
    liveUrl: 'https://clinicflow-eg.duckdns.org',
    coverUrl: '/projects/clinicflow/book-en.png',
    featured: true,
    skills: [
      'React',
      'TypeScript',
      'Ant Design',
      'Tailwind CSS',
      'React Query',
      'Vite',
      'Node.js',
      'Express',
      'Drizzle ORM',
      'PostgreSQL',
      'Docker',
      'GitHub Actions',
      'AWS',
      'Caddy',
      'Vitest',
      'Supertest',
    ],
  },
  {
    slug: 'contract-review-pipeline',
    title: 'Contract Review Pipeline',
    summary:
      'A human-in-the-loop contract review pipeline on Temporal that survives worker restarts, with an LLM risk report and a React review console.',
    body:
      'Each contract runs in its own child workflow, and an LLM step writes one risk report across all contracts.\n\n' +
      'A reviewer approves or sends back the result through a Temporal update with a server-side validator. A run can wait up to 3 days for review without holding any resources.\n\n' +
      'A FastAPI service sits in front of Temporal, and the React + TypeScript console shows live status, with RTL support and light/dark themes.',
    repoUrl: 'https://github.com/y0emad/workspace',
    liveUrl: null,
    featured: false,
    skills: ['Temporal', 'Python', 'FastAPI', 'React', 'TypeScript', 'Docker'],
  },
  {
    slug: 'nasa-mission-control',
    title: 'NASA Mission Control',
    summary:
      'Schedule a launch to a habitable exoplanet and watch it fly from the pad to orbit in 3D, then explore those planets and the solar system. React and three.js on a typed Express API, tested end to end with Playwright.',
    body:
      'A mission control app with a React 18 client, built with Vite, and a REST API in Node.js, Express and TypeScript on MongoDB Atlas.\n\n' +
      'Scheduling a mission plays a 3D launch made with three.js, from a pad at dusk with a service tower, lightning masts and a flame trench: countdown, liftoff, max Q, stage separation, fairing separation, engine cutoff, ' +
      'and the spacecraft separating and unfolding its solar panels over a textured Earth. The request to the API runs during the countdown, so the count holds while the server answers, ' +
      'and the launch is scrubbed before ignition, showing the reasons the server gave, if it rejects the data.\n\n' +
      'The 7 habitable Kepler planets can be explored in 3D, each around its star inside the zone where liquid water could exist, with the numbers worked out from the Kepler data by the API. ' +
      'A 3D solar system shows the planets where they are today, Upcoming missions count down live, and the launch page shows NASA’s Astronomy Picture of the Day.\n\n' +
      'Jest and Supertest test the API, 18 Playwright tests drive the real app in a browser, and every merge to main publishes a Docker image that the server picks up on its own.',
    repoUrl: 'https://github.com/y0emad/Nasa',
    liveUrl: 'https://nasa-dev.duckdns.org',
    coverUrl: '/projects/nasa/launch-liftoff.jpg',
    featured: true,
    skills: [
      'React',
      'Three.js',
      'Vite',
      'Node.js',
      'Express',
      'TypeScript',
      'MongoDB',
      'Mongoose',
      'Jest',
      'Playwright',
      'Docker',
      'GitHub Actions',
    ],
  },
  {
    slug: 'food-delivery-api',
    title: 'Food Delivery API',
    summary: 'A food delivery backend with JWT auth, orders and sessions, using MongoDB and Redis caching.',
    body:
      'Auth, orders and sessions with JWT access and refresh tokens, MongoDB for data and Redis for caching.\n\n' +
      'The Redis client was rewritten as a singleton to stop the app from opening a new connection on every request.',
    repoUrl: 'https://github.com/y0emad/SwiggyApp',
    liveUrl: null,
    featured: false,
    skills: ['Node.js', 'Express', 'TypeScript', 'MongoDB', 'Mongoose', 'Redis', 'JWT'],
  },
  {
    slug: 'printing-press',
    title: 'Printing Press Web App',
    summary:
      "Graduation project: the user and admin apps for Helwan University's printing press, designed in Figma and built in React.",
    body:
      'I designed the full user and admin UI in Figma, then built both apps in React.\n\n' +
      'The admin app lives in its own repo: https://github.com/y0emad/FrontEndAdmin',
    repoUrl: 'https://github.com/y0emad/FrontEndUser',
    liveUrl: null,
    featured: false,
    skills: ['React', 'JavaScript', 'Figma'],
  },
]

async function seed() {
  await db.transaction(async (tx) => {
    await tx.delete(projects)
    await tx.delete(skills)

    const insertedSkills = await tx
      .insert(skills)
      .values(SKILLS.map((s, i) => ({ ...s, sortOrder: i })))
      .returning()

    const skillId = (name: string) => {
      const skill = insertedSkills.find((s) => s.name === name)
      if (!skill) throw new Error(`Unknown skill: ${name}`)
      return skill.id
    }

    for (const [i, { skills: names, ...data }] of PROJECTS.entries()) {
      const [project] = await tx
        .insert(projects)
        .values({ ...data, caseStudy: CASE_STUDIES[data.slug] ?? null, sortOrder: i })
        .returning()
      await tx.insert(projectSkills).values(names.map((name) => ({ projectId: project.id, skillId: skillId(name) })))
    }

    console.log(` Seeded ${insertedSkills.length} skills and ${PROJECTS.length} projects`)
  })
}

seed()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => pool.end())
