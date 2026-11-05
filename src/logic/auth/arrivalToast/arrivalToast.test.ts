import { describe, expect, it } from 'vitest'
import {
  ARRIVAL_FLAG_KEY,
  arrivalToastFor,
  consumeArrivalFlag,
  type ArrivalFlag,
  type ArrivalFlagStorage,
} from '@/logic/auth/arrivalToast/arrivalToast'

function storageHolding(flag: ArrivalFlag | null): ArrivalFlagStorage {
  const entries = new Map<string, string>()
  if (flag) entries.set(ARRIVAL_FLAG_KEY, flag)

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    removeItem: (key: string) => {
      entries.delete(key)
    },
  }
}

describe('arrivalToastFor — RM3, RM4 (toast après signup / signin)', () => {
  it('compose le toast de bienvenue après un signup réussi', () => {
    const flag = 'signup'
    const firstName = 'Marc'

    expect(arrivalToastFor(flag, firstName)).toEqual({
      type: 'success',
      message: 'Bienvenue Marc, ton compte est créé.',
    })
  })

  it('compose le toast de retour après un signin réussi, sans point final', () => {
    const flag = 'signin'
    const firstName = 'Julie'

    expect(arrivalToastFor(flag, firstName)).toEqual({
      type: 'success',
      message: 'Content de te revoir Julie',
    })
  })
})

describe('arrivalToastFor — RM24 (pas de toast au reload, flag consommé)', () => {
  it("ne renvoie aucun toast quand le flag n'est plus présent (reload, retour navigateur)", () => {
    const flag = null
    const firstName = 'Marc'

    expect(arrivalToastFor(flag, firstName)).toBeNull()
  })
})

describe('arrivalToastFor — RM25 (ouverture directe avec session persistée)', () => {
  it("ne renvoie aucun toast quand il n'y a jamais eu de flag de navigation", () => {
    const flag = null
    const firstName = 'Julie'

    expect(arrivalToastFor(flag, firstName)).toBeNull()
  })
})

describe('consumeArrivalFlag — RM24, RM25 (la provenance ne sert qu’une fois)', () => {
  it('rend le flag posé par le signin au 1er appel', () => {
    const storageAfterSignin = storageHolding('signin')

    expect(consumeArrivalFlag(storageAfterSignin)).toBe('signin')
  })

  it('rend le flag posé par le signup au 1er appel', () => {
    const storageAfterSignup = storageHolding('signup')

    expect(consumeArrivalFlag(storageAfterSignup)).toBe('signup')
  })

  it('ne rend plus rien au 2e appel, le flag a été effacé dès qu’il a servi', () => {
    const storageAfterSignup = storageHolding('signup')

    consumeArrivalFlag(storageAfterSignup)

    expect(consumeArrivalFlag(storageAfterSignup)).toBeNull()
  })

  it('efface le flag du storage dès le 1er appel', () => {
    const storageAfterSignup = storageHolding('signup')

    consumeArrivalFlag(storageAfterSignup)

    expect(storageAfterSignup.getItem(ARRIVAL_FLAG_KEY)).toBeNull()
  })

  it('rend null quand le storage ne porte aucun flag (session persistée)', () => {
    const storageWithoutFlag = storageHolding(null)

    expect(consumeArrivalFlag(storageWithoutFlag)).toBeNull()
  })
})
