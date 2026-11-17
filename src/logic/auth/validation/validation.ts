// Validation client déclenchée à la soumission des formulaires d'auth (CA10, CA11, CA20).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isFirstNameValid(firstName: string): boolean {
  return firstName.trim() !== ''
}

export function isEmailValid(email: string): boolean {
  return EMAIL_PATTERN.test(email)
}

export function isPasswordValid(password: string): boolean {
  return password.length >= 6
}
