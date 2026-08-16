import type { ApiError, Session, SessionUser } from '@/types/apiContract'

// Endpoints fournis par Better Auth (montés sur /api/auth/*, cf. apiContract.ts).
// Le back ré-emballe ses erreurs en ApiError { code, message } avec un statut HTTP
// cohérent — on lit donc directement le corps JSON en cas d'échec.

export type AuthApiResult =
  | { ok: true; user: SessionUser }
  | { ok: false; error: ApiError }

async function postAuth(
  baseUrl: string,
  path: string,
  body: unknown,
  fetchImpl: typeof fetch
): Promise<AuthApiResult> {
  const response = await fetchImpl(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })

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
