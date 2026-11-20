import * as Sentry from '@sentry/react'

// Sans DSN, on n'initialise rien : en local la variable est absente, donc les erreurs de
// développement ne partent pas chez Sentry et ne consomment pas le quota.
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN
  if (!dsn) return

  Sentry.init({
    dsn,
    // Pas le mode de build : Vercel construit toujours en "production", y compris pour le
    // déploiement DEV, et les 2 environnements seraient alors indiscernables dans Sentry.
    // "inconnu" plutôt qu'une valeur par défaut plausible, pour que l'oubli se voie.
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT ?? 'inconnu',
  })
}
