import { describe, expect, it } from 'vitest'
import { isSigninFormFilled, isSignupFormFilled } from '@/logic/auth/formState/formState'

describe('isSigninFormFilled — RM32 (signin, bouton grisé tant que les champs sont vides)', () => {
  it('active le bouton quand email et mot de passe sont remplis', () => {
    const email = 'jean.dev@gmail.com'
    const password = 'motdepasse123'

    expect(isSigninFormFilled(email, password)).toBe(true)
  })

  it("grise le bouton quand l'email est vide", () => {
    const email = ''
    const password = 'motdepasse123'

    expect(isSigninFormFilled(email, password)).toBe(false)
  })

  it('grise le bouton quand le mot de passe est vide', () => {
    const email = 'jean.dev@gmail.com'
    const password = ''

    expect(isSigninFormFilled(email, password)).toBe(false)
  })

  it('grise le bouton quand les deux champs sont vides', () => {
    const email = ''
    const password = ''

    expect(isSigninFormFilled(email, password)).toBe(false)
  })

  it("grise le bouton quand l'email ne contient que des espaces", () => {
    const email = '   '
    const password = 'motdepasse123'

    expect(isSigninFormFilled(email, password)).toBe(false)
  })
})

describe('isSignupFormFilled — RM33 (signup, bouton grisé tant qu’un champ requis est vide)', () => {
  it('active le bouton quand prénom, email et mot de passe sont remplis', () => {
    const firstName = 'Marc'
    const email = 'marc@gmail.com'
    const password = 'motdepasse123'

    expect(isSignupFormFilled(firstName, email, password)).toBe(true)
  })

  it('grise le bouton quand le prénom est vide', () => {
    const firstName = ''
    const email = 'marc@gmail.com'
    const password = 'motdepasse123'

    expect(isSignupFormFilled(firstName, email, password)).toBe(false)
  })

  it("grise le bouton quand l'email est vide", () => {
    const firstName = 'Marc'
    const email = ''
    const password = 'motdepasse123'

    expect(isSignupFormFilled(firstName, email, password)).toBe(false)
  })

  it('grise le bouton quand le mot de passe est vide', () => {
    const firstName = 'Marc'
    const email = 'marc@gmail.com'
    const password = ''

    expect(isSignupFormFilled(firstName, email, password)).toBe(false)
  })

  it('grise le bouton quand le prénom ne contient que des espaces', () => {
    const firstName = '   '
    const email = 'marc@gmail.com'
    const password = 'motdepasse123'

    expect(isSignupFormFilled(firstName, email, password)).toBe(false)
  })
})

describe('isSigninFormFilled — RM10, RM11, RM20 (signin, aucun format vérifié)', () => {
  it("active le bouton avec un email mal formé : le signin ne vérifie pas le format de l'email", () => {
    const malformedEmail = 'jean.dev.gmail.com'
    const password = 'motdepasse123'

    expect(isSigninFormFilled(malformedEmail, password)).toBe(true)
  })

  it('active le bouton avec un mot de passe de moins de 8 caractères : le signin ne vérifie pas sa longueur', () => {
    const email = 'jean.dev@gmail.com'
    const shortPassword = 'abc'

    expect(isSigninFormFilled(email, shortPassword)).toBe(true)
  })
})
