import { describe, expect, it, vi } from 'vitest'
import { getSession, signIn, signUp } from './authApi'

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

    const result = await signUp(
      BASE_URL,
      { name: 'Marc', email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(fetchImpl).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/sign-up/email`,
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    )
    expect(result).toEqual({ ok: true, user })
  })

  it('returns the ApiError from the response body on failure', async () => {
    const apiError = { code: 'EMAIL_ALREADY_EXISTS', message: 'Cet email est déjà utilisé' }
    const fetchImpl = fakeFetch({ ok: false, json: async () => apiError })

    const result = await signUp(
      BASE_URL,
      { name: 'Marc', email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(result).toEqual({ ok: false, error: apiError })
  })

  it('falls back to a generic INTERNAL_ERROR when the error body is not JSON', async () => {
    const fetchImpl = fakeFetch({
      ok: false,
      json: async () => {
        throw new Error('not json')
      },
    })

    const result = await signUp(
      BASE_URL,
      { name: 'Marc', email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(result).toEqual({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue' },
    })
  })

  it('returns a network-error result when the request itself fails', async () => {
    const fetchImpl = throwingFetch(new Error('network down'))

    const result = await signUp(
      BASE_URL,
      { name: 'Marc', email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('INTERNAL_ERROR')
    }
  })
})

describe('signIn', () => {
  it('returns the user on success', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: async () => ({ user }) })

    const result = await signIn(
      BASE_URL,
      { email: 'marc@gmail.com', password: 'motdepasse123' },
      fetchImpl
    )

    expect(fetchImpl).toHaveBeenCalledWith(
      `${BASE_URL}/api/auth/sign-in/email`,
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    )
    expect(result).toEqual({ ok: true, user })
  })

  it('returns the ApiError from the response body on failure', async () => {
    const apiError = { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
    const fetchImpl = fakeFetch({ ok: false, json: async () => apiError })

    const result = await signIn(
      BASE_URL,
      { email: 'marc@gmail.com', password: 'wrong' },
      fetchImpl
    )

    expect(result).toEqual({ ok: false, error: apiError })
  })
})

describe('getSession', () => {
  it('returns the session when the user is authenticated', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: async () => ({ user }) })

    const result = await getSession(BASE_URL, fetchImpl)

    expect(result).toEqual({ user })
  })

  it('returns null when the response is not ok', async () => {
    const fetchImpl = fakeFetch({ ok: false, json: async () => null })

    const result = await getSession(BASE_URL, fetchImpl)

    expect(result).toBeNull()
  })

  it('returns null when the payload has no user', async () => {
    const fetchImpl = fakeFetch({ ok: true, json: async () => ({}) })

    const result = await getSession(BASE_URL, fetchImpl)

    expect(result).toBeNull()
  })
})
