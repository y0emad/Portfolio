import { Router } from 'express'
import { contactLimiter } from '../MiddleWare/rateLimit.js'
import { postContacts } from '../Validators/contactValid.js'
import { checkErrors } from '../MiddleWare/checkErrors.js'
import { sendMessage } from '../Controller/contactController.js'

class ContactsRoutes {
  router = Router()
  constructor() {
    this.postContacts()
  }

  postContacts() {
    this.router.post('/', contactLimiter, postContacts, checkErrors, sendMessage)
  }
}

export default new ContactsRoutes().router
