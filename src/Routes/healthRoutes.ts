import { Router } from 'express'

import { getHealth, getLive } from '../Controller/healthController.js'

class HealthRoutes {
  router = Router()
  constructor() {
    this.getHealth()
  }

  getHealth() {
    this.router.get('/', getHealth)
    this.router.get('/live', getLive)
  }
}

export default new HealthRoutes().router
