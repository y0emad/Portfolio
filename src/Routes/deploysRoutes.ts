import { Router } from 'express'
import { getDeploys } from '../Controller/deploysController.js'

class DeploysRoutes {
  router = Router()
  constructor() {
    this.getDeploys()
  }

  getDeploys() {
    this.router.get('/', getDeploys)
  }
}

export default new DeploysRoutes().router
