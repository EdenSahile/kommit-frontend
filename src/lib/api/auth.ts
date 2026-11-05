import type { ApiError, Session, SessionUser } from '@/types/apiContract'

// Le back ré-emballe les erreurs de Better Auth en ApiError, d'où la lecture directe du corps JSON.

// `error: null` = le serveur n'a pas répondu, il n'y a donc aucune ApiError à
// afficher. KOM-07 ne couvre pas ce cas (il relève de RM18/RM19), et on n'invente
// pas de message : l'appelant ne montre rien et rend la main à l'utilisateur.
export type AuthApiResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: ApiError | null }

async function postAuth(
  baseUrl: string,
  path: string,
  body: unknown,
  fetchImpl: typeof fetch
): Promise<AuthApiResult> {
  let response: Response
  try {
    response = await fetchImpl(`${baseUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    })
  } catch {
    return { ok: false, error: null }
  }

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    return {
      ok: false,
      error: (payload as ApiError) ?? {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur interne est survenue',
      },
    }
  }

  return { ok: true, user: (payload as { user: SessionUser }).user }
}

export function signUp(
  baseUrl: string,
  body: { name: string; email: string; password: string },
  fetchImpl: typeof fetch = fetch
): Promise<AuthApiResult> {
  return postAuth(baseUrl, '/api/auth/sign-up/email', body, fetchImpl)
}

export function signIn(
  baseUrl: string,
  body: { email: string; password: string },
  fetchImpl: typeof fetch = fetch
): Promise<AuthApiResult> {
  return postAuth(baseUrl, '/api/auth/sign-in/email', body, fetchImpl)
}

export async function signOut(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  await fetchImpl(`${baseUrl}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
  })
}

export async function getSession(
  baseUrl: string,
  fetchImpl: typeof fetch = fetch
): Promise<Session> {
  const response = await fetchImpl(`${baseUrl}/api/auth/get-session`, {
    credentials: 'include',
  })

  if (!response.ok) return null

  const payload = await response.json().catch(() => null)

  if (!payload || typeof payload !== 'object' || !('user' in payload)) {
    return null
  }

  return { user: (payload as { user: SessionUser }).user }
}
