import { rateLimit } from 'express-rate-limit'

export const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, msg: 'Too many requests, please try again later' },
  skip: () => process.env.NODE_ENV === 'test',
})
