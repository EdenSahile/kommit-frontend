import { describe, expect, it } from 'vitest'
import { errorTargetFor } from '@/logic/auth/errorTarget/errorTarget'

describe('errorTargetFor — CA9, CA13', () => {
  it("route EMAIL_ALREADY_EXISTS vers le champ email (signup, l'email est déjà pris)", () => {
    const targetForExistingEmail = errorTargetFor('EMAIL_ALREADY_EXISTS')

    expect(targetForExistingEmail).toBe('email')
  })

  it("route INVALID_CREDENTIALS vers l'erreur générique du formulaire, sans désigner un champ (signin)", () => {
    const targetForBadCredentials = errorTargetFor('INVALID_CREDENTIALS')

    expect(targetForBadCredentials).toBe('form')
  })
})
