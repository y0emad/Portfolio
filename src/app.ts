import { existsSync } from 'node:fs'
import path from 'node:path'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { errorHandler, notFound } from './MiddleWare/errorHandler.js'
import ProjectsRoutes from './Routes/projectsRoutes.js'
import skillsRoutes from './Routes/skillsRoutes.js'
import contactRoutes from './Routes/contactRoutes.js'
import healthRoutes from './Routes/healthRoutes.js'
import deploysRoutes from './Routes/deploysRoutes.js'

const app = express()
const api = express.Router()
const httpsOnly = process.env.HTTPS_ONLY === 'true'

if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        frameSrc: ["'self'", 'https://embed.figma.com', 'https://www.figma.com'],
        upgradeInsecureRequests: httpsOnly ? [] : null,
      },
    },
    strictTransportSecurity: httpsOnly,
  }),
)
app.use(cors())
app.use(express.json({ limit: '20kb' }))

app.use('/health', healthRoutes)

api.use('/projects', ProjectsRoutes)
api.use('/skills', skillsRoutes)
api.use('/contact', contactRoutes)
api.use('/deploys', deploysRoutes)
app.use('/api', api)
app.use('/api', notFound)

const clientDist = path.resolve(process.env.CLIENT_DIST ?? 'client/dist')
if (existsSync(path.join(clientDist, 'index.html'))) {
  app.use(
    express.static(clientDist, {
      index: false,
      setHeaders: (res, file) => {
        const cache = file.includes(`${path.sep}assets${path.sep}`)
          ? 'public, max-age=31536000, immutable'
          : 'public, max-age=3600'
        res.setHeader('Cache-Control', cache)
      },
    }),
  )
  app.get('/{*path}', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache')
    res.sendFile(path.join(clientDist, 'index.html'))
  })
}

app.use(notFound)
app.use(errorHandler)
export default app
