import { Router } from 'express'
import { getProjects, getSlug } from '../Controller/projectsController.js'

class ProjectsRoutes {
  router = Router()
  constructor() {
    this.getProjects()
  }

  getProjects() {
    this.router.get('/', getProjects)
    this.router.get('/:slug', getSlug)
  }
}

export default new ProjectsRoutes().router
