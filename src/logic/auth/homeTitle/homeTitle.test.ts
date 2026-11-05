import { describe, expect, it } from 'vitest'
import { homeTitleFor } from '@/logic/auth/homeTitle/homeTitle'

describe('homeTitleFor — RM2 (accueil connecté, titre personnalisé)', () => {
  it("compose « Quoi de neuf aujourd'hui, {prénom} ? » à partir du prénom de la session", () => {
    const firstName = 'Marc'

    const titleForMarc = homeTitleFor(firstName)

    expect(titleForMarc.lead + titleForMarc.accent).toBe(
      "Quoi de neuf aujourd'hui, Marc ?"
    )
  })

  it('met le prénom et le point d’interrogation dans le morceau accentué', () => {
    const firstName = 'Marc'

    const titleForMarc = homeTitleFor(firstName)

    expect(titleForMarc).toEqual({
      lead: "Quoi de neuf aujourd'hui, ",
      accent: 'Marc ?',
    })
  })

  it('reprend le prénom tel quel, sans le transformer', () => {
    const composedFirstName = 'Jean-Luc'

    const titleForJeanLuc = homeTitleFor(composedFirstName)

    expect(titleForJeanLuc.lead + titleForJeanLuc.accent).toBe(
      "Quoi de neuf aujourd'hui, Jean-Luc ?"
    )
  })
})
