// Décide, à un instant donné, quels champs du signup doivent afficher leur erreur
// de format (RM30) : rien avant la 1re soumission, puis recalcul à chaque saisie.
// Ne porte aucun texte : les messages vivent dans `data/signup.ts`.

// STUB — aucune logique métier ici. Implémentation à l'étape suivante du workflow.

export type SignupFieldValues = {
  firstName: string
  email: string
  password: string
}

export type FlaggedSignupFields = {
  firstName: boolean
  email: boolean
  password: boolean
}

export function signupFieldsToFlag(
  _values: SignupFieldValues,
  _hasSubmittedOnce: boolean
): FlaggedSignupFields {
  return { firstName: false, email: false, password: false }
}
