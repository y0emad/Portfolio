import { Router } from 'express'
import { getSkills } from '../Controller/skillsController.js'

class SkillsRoutes {
  router = Router()
  constructor() {
    this.getSkills()
  }

  getSkills() {
    this.router.get('/', getSkills)
  }
}

export default new SkillsRoutes().router
