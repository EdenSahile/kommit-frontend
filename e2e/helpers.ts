import type { APIRequestContext, Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

// Le backend est un vrai serveur séparé (Better Auth) : ce fichier n'en démarre aucun,
// il suppose juste qu'il tourne à cette adresse (cf. .env.local -> VITE_API_URL).
export const API_BASE_URL = process.env.VITE_API_URL ?? 'http://localhost:3000'

/** Email unique par run, pour que deux exécutions de la suite ne butent pas sur
 * l'unicité imposée par le backend (signup). */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.dev`
}

/** Localise le champ de saisie associé à un libellé visible.
 *
 * `AuthTextField` (src/components/ui/AuthTextField.tsx) rend le libellé dans un
 * `<span>` -- pas un `<label htmlFor>` -- donc `getByLabel` ne fonctionne pas. Le
 * `<span>` et l'`<input>` sont des frères directs dans le DOM : on cible le libellé
 * visible par son texte, puis on prend l'input qui le suit immédiatement. */
export function fieldByLabel(page: Page, label: string): Locator {
  return page
    .getByText(label, { exact: true })
    .locator('xpath=following-sibling::input')
}

export type TestUser = { name: string; email: string; password: string }

/** Crée un compte directement via l'API (Better Auth), sans passer par l'UI --
 * pour les scénarios qui ont besoin d'un compte déjà existant (signin, email déjà
 * pris) sans supposer un compte figé en base. */
export async function createAccountViaApi(
  request: APIRequestContext,
  user: TestUser
): Promise<void> {
  const response = await request.post(
    `${API_BASE_URL}/api/auth/sign-up/email`,
    { data: user }
  )
  if (!response.ok()) {
    throw new Error(
      `createAccountViaApi a échoué (${response.status()}) : ${await response.text()}`
    )
  }
}

/** Remplit et soumet le formulaire de signup via l'UI, attend la redirection vers
 * l'accueil connecté. */
export async function signUpViaUi(page: Page, user: TestUser): Promise<void> {
  await page.goto('/signup')
  await fieldByLabel(page, 'Prénom*').fill(user.name)
  await fieldByLabel(page, 'Email*').fill(user.email)
  await fieldByLabel(page, 'Mot de passe*').fill(user.password)
  await page.getByRole('button', { name: 'Créer un compte' }).click()
  await expect(page).toHaveURL('/')
}

/** Remplit et soumet le formulaire de signin via l'UI, attend la redirection vers
 * l'accueil connecté. */
export async function signInViaUi(
  page: Page,
  credentials: { email: string; password: string }
): Promise<void> {
  await page.goto('/signin')
  await fieldByLabel(page, 'Email').fill(credentials.email)
  await fieldByLabel(page, 'Mot de passe').fill(credentials.password)
  await page.getByRole('button', { name: 'Me connecter' }).click()
  await expect(page).toHaveURL('/')
}
