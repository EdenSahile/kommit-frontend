import * as Sentry from '@sentry/react'

// Sans DSN, on n'initialise rien : en local la variable est absente, donc les erreurs de
// développement ne partent pas chez Sentry et ne consomment pas le quota.
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
  })
}
