import { describe, expect, it } from 'vitest'
import { arrivalToastFor } from './arrivalToast'

describe('arrivalToastFor — CA3, CA4 (toast après signup / signin)', () => {
  it('compose le toast de bienvenue après un signup réussi', () => {
    const flag = 'signup'
    const firstName = 'Marc'

    expect(arrivalToastFor(flag, firstName)).toEqual({
      type: 'success',
      message: 'Bienvenue Marc, ton compte est créé.',
    })
  })

  it('compose le toast de retour après un signin réussi', () => {
    const flag = 'signin'
    const firstName = 'Julie'

    expect(arrivalToastFor(flag, firstName)).toEqual({
      type: 'success',
      message: 'Content de te revoir Julie.',
    })
  })
})

describe('arrivalToastFor — CA24 (pas de toast au reload, flag consommé)', () => {
  it("ne renvoie aucun toast quand le flag n'est plus présent (reload, retour navigateur)", () => {
    const flag = null
    const firstName = 'Marc'

    expect(arrivalToastFor(flag, firstName)).toBeNull()
  })
})

describe('arrivalToastFor — CA25 (ouverture directe avec session persistée)', () => {
  it("ne renvoie aucun toast quand il n'y a jamais eu de flag de navigation", () => {
    const flag = null
    const firstName = 'Julie'

    expect(arrivalToastFor(flag, firstName)).toBeNull()
  })
})
