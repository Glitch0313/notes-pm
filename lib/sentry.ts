// lib/sentry.ts — Lightweight Sentry wrapper
// Install: npm install @sentry/nextjs
// Then run: npx @sentry/wizard@latest -i nextjs
// Or configure manually via sentry.client.config.ts / sentry.server.config.ts

const DSN = process.env.SENTRY_DSN

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (!DSN) {
    console.error('[captureException]', error, context)
    return
  }
  // When @sentry/nextjs is installed, replace this with:
  // import * as Sentry from '@sentry/nextjs'
  // Sentry.captureException(error, { extra: context })
  console.error('[Sentry]', error, context)
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!DSN) {
    console.log(`[captureMessage][${level}]`, message)
    return
  }
  console.log(`[Sentry][${level}]`, message)
}
