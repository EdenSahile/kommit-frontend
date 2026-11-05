import { describe, expect, it, vi } from 'vitest'
import { getSession, signIn, signUp } from '@/lib/api/auth'

const BASE_URL = 'http://localhost:3000'

function fakeFetch(response: {
  ok: boolean
  json: () => Promise<unknown>
}) {
  return vi.fn().mockResolvedValue(response as Response)
}

function throwingFetch(error: Error) {
  return vi.fn().mockRejectedValue(error)
}

const user = { id: '1', name: 'Marc', email: 'marc@gmail.com' }

describe('signUp', () => {
  it('returns the user on success', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: async () => ({ user }) })

    const signupOutcome = await signUp(
      BASE_URL,
      { name: 'Marc', email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(fetchImpl).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/sign-up/email`,
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    )
    expect(signupOutcome).toEqual({ ok: true, user })
  })

  it('returns the ApiError from the response body on failure', async () => {
    const apiError = { code: 'EMAIL_ALREADY_EXISTS', message: 'Cet email est déjà utilisé' }
    const fetchImpl = fakeFetch({ ok: false, json: async () => apiError })

    const signupOutcome = await signUp(
      BASE_URL,
      { name: 'Marc', email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(signupOutcome).toEqual({ ok: false, error: apiError })
  })

  it('falls back to a generic INTERNAL_ERROR when the error body is not JSON', async () => {
    const fetchImpl = fakeFetch({
      ok: false,
      json: async () => {
        throw new Error('not json')
      },
    })

    const signupOutcome = await signUp(
      BASE_URL,
      { name: 'Marc', email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(signupOutcome).toEqual({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue' },
    })
  })

  it('returns a network error when the request itself fails', async () => {
    const fetchImpl = throwingFetch(new Error('network down'))

    const signupOutcome = await signUp(
      BASE_URL,
      { name: 'Marc', email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(signupOutcome.ok).toBe(false)
    if (!signupOutcome.ok) {
      expect(signupOutcome.error.code).toBe('INTERNAL_ERROR')
    }
  })
})

describe('signIn', () => {
  it('returns the user on success', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: async () => ({ user }) })

    const signinOutcome = await signIn(
      BASE_URL,
      { email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(fetchImpl).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/sign-in/email`,
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    )
    expect(signinOutcome).toEqual({ ok: true, user })
  })

  it('returns the ApiError from the response body on failure', async () => {
    const apiError = { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    const fetchImpl = fakeFetch({ ok: false, json: async () => apiError })

    const signinOutcome = await signIn(
      BASE_URL,
      { email: 'marc@gmail.com', password: 'wrong' },
      fetchImpl
    )

    expect(signinOutcome).toEqual({ ok: false, error: apiError })
  })
})

describe('getSession', () => {
  it('returns the session when the user is authenticated', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: async () => ({ user }) })

    const session = await getSession(BASE_URL, fetchImpl)

    expect(session).toEqual({ user })
  })

  it('returns null when the response is not ok', async () => {
    const fetchImpl = fakeFetch({ ok: false, json: async () => null })

    const session = await getSession(BASE_URL, fetchImpl)

    expect(session).toBeNull()
  })

  it('returns null when the payload has no user', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: async () => ({}) })

    const session = await getSession(BASE_URL, fetchImpl)

    expect(session).toBeNull()
  })
})
