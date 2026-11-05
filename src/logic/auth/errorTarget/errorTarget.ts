import type { AuthErrorCode } from '@/types/apiContract'

// Route un code d'erreur d'auth vers l'endroit où l'afficher (CA9, CA13).
// Le texte affiché reste `error.message`, déjà prêt côté API (voir apiContract.ts) :
// cette fonction ne décide que de la CIBLE, jamais du texte.

export type AuthErrorTarget = 'email' | 'form'

export function authErrorTargetFor(code: AuthErrorCode): AuthErrorTarget {
  return code === 'EMAIL_ALREADY_EXISTS' ? 'email' : 'form'
}
