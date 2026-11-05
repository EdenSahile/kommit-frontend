import { describe, expect, it } from 'vitest'
import { isAuthSubmitDisabled } from '@/logic/auth/submitState/submitState'

describe('isAuthSubmitDisabled — RM17 (appel en cours → bouton désactivé)', () => {
  it('désactive le bouton pendant un appel, même si le formulaire est rempli', () => {
    const isFormFilled = true
    const isCallInProgress = true

    expect(isAuthSubmitDisabled(isFormFilled, isCallInProgress)).toBe(true)
  })

  it("laisse le bouton actif quand le formulaire est rempli et qu'aucun appel n'est en cours", () => {
    const isFormFilled = true
    const isCallInProgress = false

    expect(isAuthSubmitDisabled(isFormFilled, isCallInProgress)).toBe(false)
  })
})

describe('isAuthSubmitDisabled — RM32, RM33 (bouton grisé tant que les champs sont vides)', () => {
  it("désactive le bouton quand le formulaire n'est pas rempli", () => {
    const isFormFilled = false
    const isCallInProgress = false

    expect(isAuthSubmitDisabled(isFormFilled, isCallInProgress)).toBe(true)
  })

  it('reste désactivé quand le formulaire est incomplet et un appel est en cours', () => {
    const isFormFilled = false
    const isCallInProgress = true

    expect(isAuthSubmitDisabled(isFormFilled, isCallInProgress)).toBe(true)
  })
})
