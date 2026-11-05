import { describe, expect, it } from 'vitest'
import { isEmailValid, isFirstNameValid, isPasswordValid } from './validation'

describe('isFirstNameValid — CA20', () => {
  it('accepte un prénom simple', () => {
    const firstName = 'Marc'

    expect(isFirstNameValid(firstName)).toBe(true)
  })

  it('accepte un prénom entouré d’espaces, une fois trimé', () => {
    const firstName = '  Marc  '

    expect(isFirstNameValid(firstName)).toBe(true)
  })

  it('refuse une chaîne vide', () => {
    const firstName = ''

    expect(isFirstNameValid(firstName)).toBe(false)
  })

  it("refuse un prénom composé uniquement d'espaces", () => {
    const firstName = '   '

    expect(isFirstNameValid(firstName)).toBe(false)
  })
})

describe('isEmailValid — CA11', () => {
  it('accepte un email bien formé', () => {
    const email = 'jean.dev@gmail.com'

    expect(isEmailValid(email)).toBe(true)
  })

  it('refuse une chaîne vide', () => {
    const email = ''

    expect(isEmailValid(email)).toBe(false)
  })

  it('refuse un email sans arobase', () => {
    const email = 'jean.dev.gmail.com'

    expect(isEmailValid(email)).toBe(false)
  })

  it('refuse un email sans domaine après l’arobase', () => {
    const email = 'jean.dev@'

    expect(isEmailValid(email)).toBe(false)
  })

  it('refuse un email sans partie locale avant l’arobase', () => {
    const email = '@gmail.com'

    expect(isEmailValid(email)).toBe(false)
  })
})

describe('isPasswordValid — CA10', () => {
  it('accepte un mot de passe de 8 caractères exactement', () => {
    const password = 'abcdefgh'

    expect(isPasswordValid(password)).toBe(true)
  })

  it('accepte un mot de passe de plus de 8 caractères', () => {
    const password = 'motdepasse123'

    expect(isPasswordValid(password)).toBe(true)
  })

  it('refuse un mot de passe de 7 caractères', () => {
    const password = 'abcdefg'

    expect(isPasswordValid(password)).toBe(false)
  })

  it('refuse une chaîne vide', () => {
    const password = ''

    expect(isPasswordValid(password)).toBe(false)
  })
})
