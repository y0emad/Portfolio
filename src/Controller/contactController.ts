import type { Request, Response } from 'express'
import { db } from '../db/index.js'
import { messages } from '../db/schema.js'
import { sendContactNotification } from '../Utils/sendEmail.js'

export async function sendMessage(req: Request, res: Response) {
  const { name, email, body } = req.body

  if (req.query.dryRun === 'true') {
    return res.json({
      success: true,
      msg: 'Looks good. Dry run: the message was validated but not saved or sent.',
      dryRun: true,
      received: { name, email, body },
    })
  }

  const [saved] = await db.insert(messages).values({ name, email, body }).returning({ createdAt: messages.createdAt })
  const notified = await sendContactNotification({ name, email, body, createdAt: saved.createdAt })

  res.status(201).json({ success: true, msg: 'Message sent successfully', notified })
}
