// Decide si le bouton de soumission d'un formulaire d'auth doit être actif.

export function isSigninFormFilled(email: string, password: string): boolean {
  return email.trim() !== '' && password.trim() !== ''
}

export function isSignupFormFilled(
  firstName: string,
  email: string,
  password: string
): boolean {
  return (
    firstName.trim() !== '' && email.trim() !== '' && password.trim() !== ''
  )
}
