import { describe, expect, it } from 'vitest'
import {
  signupFieldsToFlag,
  type SignupFieldValues,
} from '@/logic/auth/fieldErrors/fieldErrors'

const INVALID_SIGNUP_VALUES: SignupFieldValues = {
  firstName: '   ',
  email: 'marc.gmail.com',
  password: 'abc',
}

describe('signupFieldsToFlag — RM30 (les erreurs apparaissent à la 1re soumission)', () => {
  it("ne signale aucun champ avant la 1re soumission, même quand tout est invalide", () => {
    const hasSubmittedOnce = false

    const fieldsFlaggedBeforeSubmit = signupFieldsToFlag(
      INVALID_SIGNUP_VALUES,
      hasSubmittedOnce
    )

    expect(fieldsFlaggedBeforeSubmit).toEqual({
      firstName: false,
      email: false,
      password: false,
    })
  })

  it('signale les 3 champs invalides à la 1re soumission', () => {
    const hasSubmittedOnce = true

    const fieldsFlaggedAtSubmit = signupFieldsToFlag(
      INVALID_SIGNUP_VALUES,
      hasSubmittedOnce
    )

    expect(fieldsFlaggedAtSubmit).toEqual({
      firstName: true,
      email: true,
      password: true,
    })
  })

  it('ne signale aucun champ à la soumission quand les 3 valeurs sont valides', () => {
    const validSignupValues: SignupFieldValues = {
      firstName: 'Marc',
      email: 'marc@gmail.com',
      password: 'motdepasse123',
    }
    const hasSubmittedOnce = true

    const fieldsFlaggedAtSubmit = signupFieldsToFlag(validSignupValues, hasSubmittedOnce)

    expect(fieldsFlaggedAtSubmit).toEqual({
      firstName: false,
      email: false,
      password: false,
    })
  })
})

describe('signupFieldsToFlag — RM30 (les erreurs se mettent à jour pendant la saisie)', () => {
  it('cesse de signaler le champ corrigé et garde les autres signalés', () => {
    const valuesWithEmailFixed: SignupFieldValues = {
      ...INVALID_SIGNUP_VALUES,
      email: 'marc@gmail.com',
    }
    const hasSubmittedOnce = true

    const fieldsFlaggedAfterTyping = signupFieldsToFlag(
      valuesWithEmailFixed,
      hasSubmittedOnce
    )

    expect(fieldsFlaggedAfterTyping).toEqual({
      firstName: true,
      email: false,
      password: true,
    })
  })

  it('signale de nouveau un champ que la saisie rend invalide une fois soumis', () => {
    const valuesWithPasswordEmptied: SignupFieldValues = {
      firstName: 'Marc',
      email: 'marc@gmail.com',
      password: '',
    }
    const hasSubmittedOnce = true

    const fieldsFlaggedAfterTyping = signupFieldsToFlag(
      valuesWithPasswordEmptied,
      hasSubmittedOnce
    )

    expect(fieldsFlaggedAfterTyping).toEqual({
      firstName: false,
      email: false,
      password: true,
    })
  })
})
