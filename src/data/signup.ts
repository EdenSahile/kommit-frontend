/** Textes de l'écran d'inscription, messages de validation compris. */

export const SIGNUP = {
  title: 'Créer un compte',
  firstNameLabel: 'Prénom*',
  emailLabel: 'Email*',
  emailPlaceholder: 'jean.dev@gmail.com',
  passwordLabel: 'Mot de passe*',
  submit: 'Créer un compte',
  footerText: 'Tu as déjà un compte ?',
  footerLinkText: 'Connecte-toi.',
} as const

export const SIGNUP_ERRORS = {
  firstName: 'Le prénom est obligatoire.',
  email: 'Adresse email invalide.',
  password: 'Le mot de passe doit contenir au moins 8 caractères.',
} as const
