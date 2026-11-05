type Mail = {
  to: string
  subject: string
  html: string
  replyTo?: { email: string; name: string }
}

const ACCENT = '#10b981'
const INK = '#18181b'
const MUTED = '#71717a'
const LINE = '#e4e4e7'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

export function emailEnabled() {
  return Boolean(process.env.BREVO_API_KEY && process.env.EMAIL_FROM && process.env.CONTACT_NOTIFY_EMAIL)
}

async function sendWithBrevo({ to, subject, html, replyTo }: Mail) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY!,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: process.env.EMAIL_FROM_NAME || 'yousef.dev', email: process.env.EMAIL_FROM },
      to: [{ email: to }],
      replyTo,
      subject,
      htmlContent: html,
    }),
    signal: AbortSignal.timeout(10_000),
  })
  if (!res.ok) throw new Error(`Brevo responded ${res.status}: ${await res.text()}`)
}

function layout(heading: string, body: string) {
  return `
<div style="background:#f4f4f5;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:${INK};">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${LINE};">
    <div style="background:#09090b;padding:18px 28px;">
      <span style="font-family:Consolas,Menlo,monospace;font-size:16px;color:${ACCENT};">yousef.dev</span>
    </div>
    <div style="height:3px;background:${ACCENT};"></div>
    <div style="padding:28px;">
      <h2 style="margin:0 0 18px;font-size:20px;color:${INK};">${heading}</h2>
      ${body}
    </div>
  </div>
  <p style="max-width:560px;margin:16px auto 0;text-align:center;font-size:12px;color:${MUTED};">
    Sent by the contact form on your portfolio. Reply to this email to answer the sender directly.
  </p>
</div>`
}

export type ContactMessage = { name: string; email: string; body: string; createdAt: Date }

export async function sendContactNotification(m: ContactMessage): Promise<boolean> {
  if (!emailEnabled()) return false

  const name = escapeHtml(m.name)
  const email = escapeHtml(m.email)
  const body = escapeHtml(m.body).replace(/\n/g, '<br>')
  const when = m.createdAt.toLocaleString('en-GB', { timeZone: 'Africa/Cairo', dateStyle: 'full', timeStyle: 'short' })

  const html = layout(
    `New message from ${name}`,
    `
<table style="width:100%;border-collapse:collapse;margin:0 0 18px;font-size:14px;">
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid ${LINE};color:${MUTED};width:70px;">From</td>
    <td style="padding:8px 0;border-bottom:1px solid ${LINE};font-weight:600;">${name}</td>
  </tr>
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid ${LINE};color:${MUTED};">Email</td>
    <td style="padding:8px 0;border-bottom:1px solid ${LINE};"><a href="mailto:${email}" style="color:${ACCENT};">${email}</a></td>
  </tr>
  <tr>
    <td style="padding:8px 0;border-bottom:1px solid ${LINE};color:${MUTED};">When</td>
    <td style="padding:8px 0;border-bottom:1px solid ${LINE};">${when} (Cairo)</td>
  </tr>
</table>
<div style="padding:16px 18px;border-radius:8px;background:#f4f4f5;border-left:3px solid ${ACCENT};font-size:15px;line-height:1.6;">${body}</div>
<p style="margin:22px 0 0;">
  <a href="mailto:${email}" style="display:inline-block;padding:11px 18px;border-radius:8px;background:${ACCENT};color:#09090b;font-weight:600;text-decoration:none;">Reply to ${name}</a>
</p>`,
  )

  try {
    await sendWithBrevo({
      to: process.env.CONTACT_NOTIFY_EMAIL!,
      subject: `New message from ${m.name} · yousef.dev`,
      html,
      replyTo: { email: m.email, name: m.name },
    })
    return true
  } catch (err) {
    console.error('Contact notification email failed:', err)
    return false
  }
}
