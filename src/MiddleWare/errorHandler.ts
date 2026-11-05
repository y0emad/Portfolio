import type { NextFunction, Request, Response } from 'express'
import { AppError } from '../Utils/AppError.js'

const UNIQUE_MESSAGES: Record<string, string> = {}

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, msg: `Route ${req.method} ${req.originalUrl} not found` })
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ success: false, msg: err.message })
  }

  const dbError = err?.cause ?? err

  if (dbError?.code === '23505') {
    const msg = UNIQUE_MESSAGES[dbError.constraint] ?? 'This record already exists'
    return res.status(409).json({ success: false, msg })
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, msg: 'Invalid JSON body' })
  }

  console.error(dbError)
  return res.status(500).json({ success: false, msg: 'Something went wrong, please try again' })
}
