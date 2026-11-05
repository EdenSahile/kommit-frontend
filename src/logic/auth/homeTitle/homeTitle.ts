// Compose le titre de l'accueil connecté à partir du prénom de la session (RM2).
// Le titre est rendu en 2 morceaux parce que la maquette colore le prénom : `lead`
// reste en couleur de texte, `accent` est le morceau mis en avant. Leur concaténation
// est la phrase complète, c'est elle qui fait foi.

// STUB — aucune logique métier ici. Implémentation à l'étape suivante du workflow.

export type HomeTitle = {
  lead: string
  accent: string
}

export function homeTitleFor(_firstName: string): HomeTitle {
  return { lead: '', accent: '' }
}
