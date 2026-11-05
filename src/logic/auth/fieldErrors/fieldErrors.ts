import {
  isEmailValid,
  isFirstNameValid,
  isPasswordValid,
} from '@/logic/auth/validation/validation'

// Décide, à un instant donné, quels champs du signup doivent afficher leur erreur
// de format (RM30) : rien avant la 1re soumission, puis recalcul à chaque saisie.
// Ne porte aucun texte : les messages vivent dans `data/signup.ts`.

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

const NOTHING_FLAGGED: FlaggedSignupFields = {
  firstName: false,
  email: false,
  password: false,
}

export function signupFieldsToFlag(
  values: SignupFieldValues,
  hasSubmittedOnce: boolean
): FlaggedSignupFields {
  if (!hasSubmittedOnce) return NOTHING_FLAGGED

  return {
    firstName: !isFirstNameValid(values.firstName),
    email: !isEmailValid(values.email),
    password: !isPasswordValid(values.password),
  }
}
