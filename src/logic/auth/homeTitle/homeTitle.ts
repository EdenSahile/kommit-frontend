import { HOME_AUTHENTICATED } from '@/data/home'

// Le titre est rendu en 2 morceaux parce que la maquette colore le prénom : `lead`
// reste en couleur de texte, `accent` est le morceau mis en avant (RM2).

export type HomeTitle = {
  lead: string
  accent: string
}

export function homeTitleFor(firstName: string): HomeTitle {
  return {
    lead: HOME_AUTHENTICATED.titleStart,
    accent: `${firstName}${HOME_AUTHENTICATED.titleAccentSuffix}`,
  }
}
