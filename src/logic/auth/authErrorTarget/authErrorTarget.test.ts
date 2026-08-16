import { describe, expect, it } from 'vitest'
import { authErrorTargetFor } from './authErrorTarget'

describe('authErrorTargetFor — CA9, CA13', () => {
  it("route EMAIL_ALREADY_EXISTS vers le champ email (signup, l'email est déjà pris)", () => {
    const targetForExistingEmail = authErrorTargetFor('EMAIL_ALREADY_EXISTS')

    expect(targetForExistingEmail).toBe('email')
  })

  it("route INVALID_CREDENTIALS vers l'erreur générique du formulaire, sans désigner un champ (signin)", () => {
    const targetForBadCredentials = authErrorTargetFor('INVALID_CREDENTIALS')

    expect(targetForBadCredentials).toBe('form')
  })
})
