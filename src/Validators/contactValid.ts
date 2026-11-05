import { body } from 'express-validator'
export const postContacts = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .isLength({ max: 255 })
    .withMessage('Email is too long')
    .normalizeEmail(),
  body('body')
    .isString()
    .withMessage('Message must be text')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),

  body('website').optional().isEmpty().withMessage('Spam detected'),
]
