// lib/email.ts — Nodemailer email service
// Configure SMTP credentials via environment variables (see .env.example)

import nodemailer from 'nodemailer'

const isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS)

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
  })
}

async function safeSend(options: nodemailer.SendMailOptions & { devLog?: string }) {
  if (!isConfigured) {
    console.warn('[email] SMTP not configured — skipping send.')
    if (options.devLog) {
      console.info('[email][DEV]', options.devLog)
    }
    return
  }
  await createTransport().sendMail(options)
}

const FROM = `"NoteVaultPro" <${process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@notevaultpro.com'}>`

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${token}`

  await safeSend({
    from: FROM,
    to: email,
    subject: 'إعادة تعيين كلمة المرور — NoteVaultPro',
    devLog: `Reset URL for ${email}: ${resetUrl}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">إعادة تعيين كلمة المرور</h2>
        <p style="color: #374151; margin-bottom: 16px;">
          تلقّينا طلباً لإعادة تعيين كلمة مرور حسابك. اضغط على الزر أدناه خلال <strong>30 دقيقة</strong>.
        </p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 16px;">
          إعادة تعيين كلمة المرور
        </a>
        <p style="color: #6b7280; font-size: 13px;">
          إذا لم تطلب ذلك، تجاهل هذا البريد وستبقى كلمة مرورك كما هي.
        </p>
        <hr style="border-color: #e5e7eb; margin: 16px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">NoteVaultPro — منصة المذكرات الاحترافية</p>
      </div>
    `,
  })
}

// ─── Welcome Email ────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string, username: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  await safeSend({
    from: FROM,
    to: email,
    subject: 'مرحباً بك في NoteVaultPro!',
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">مرحباً ${username}!</h2>
        <p style="color: #374151; margin-bottom: 16px;">
          يسعدنا انضمامك إلى NoteVaultPro. ابدأ الآن بإنشاء مذكراتك وشاركها مع العالم.
        </p>
        <a href="${baseUrl}/dashboard"
           style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-bottom: 16px;">
          ابدأ الآن
        </a>
        <hr style="border-color: #e5e7eb; margin: 16px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">NoteVaultPro — منصة المذكرات الاحترافية</p>
      </div>
    `,
  })
}

// ─── Purchase Notification ────────────────────────────────────────────────────

export async function sendPurchaseNotificationEmail(
  sellerEmail: string,
  buyerUsername: string,
  noteTitle: string
) {
  await safeSend({
    from: FROM,
    to: sellerEmail,
    subject: `طلب شراء جديد — ${noteTitle}`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">طلب شراء جديد!</h2>
        <p style="color: #374151; margin-bottom: 16px;">
          قام <strong>${buyerUsername}</strong> بطلب شراء مذكرتك: <strong>${noteTitle}</strong>
        </p>
        <p style="color: #374151;">يرجى مراجعة لوحة الإدارة لمتابعة طلبات الشراء.</p>
        <hr style="border-color: #e5e7eb; margin: 16px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">NoteVaultPro — منصة المذكرات الاحترافية</p>
      </div>
    `,
  })
}
