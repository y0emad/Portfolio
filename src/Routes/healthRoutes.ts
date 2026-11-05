import { Router } from 'express'

import { getHealth } from '../Controller/healthController.js'

class HealthRoutes {
  router = Router()
  constructor() {
    this.getHealth()
  }

  getHealth() {
    this.router.get('/', getHealth)
  }
}

export default new HealthRoutes().router
