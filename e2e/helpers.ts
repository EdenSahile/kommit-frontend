import type { APIRequestContext, Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'

// Le backend est un vrai serveur séparé (Better Auth) : ce fichier n'en démarre aucun,
// il suppose juste qu'il tourne à cette adresse (cf. .env.local -> VITE_API_URL).
export const API_BASE_URL = process.env.VITE_API_URL ?? 'http://localhost:3000'

/** Nom du cookie de session posé par Better Auth sur le backend (relevé en direct
 * sur l'en-tête `set-cookie` de /api/auth/sign-up/email). */
export const SESSION_COOKIE_NAME = 'better-auth.session_token'

/** Les 2 messages de toast d'arrivée (RM3, RM4), pour les assertions d'absence :
 * « aucun toast d'arrivée », sans présumer lequel. */
export const ARRIVAL_TOAST_PATTERN = /Bienvenue|Content de te revoir/

/** Fenêtre d'attente pour toute assertion d'ABSENCE de toast.
 *
 * Un toast d'arrivée vit ~5,8 s (5 s de `timeout` Base UI + animation de sortie).
 * Le défaut de `expect` est 5 s : un toast qui aurait dû partir meurt de vieillesse
 * pendant que l'assertion réessaie, et le test passe à tort. 1,5 s laisse passer
 * l'animation de fermeture sans laisser le temps d'une mort naturelle. */
export const TOAST_ABSENCE_TIMEOUT = 1500

/** Fenêtre d'attente quand on veut au contraire LAISSER le toast mourir de sa mort
 * naturelle (disparition automatique, ou mise en place d'un scénario qui commence
 * toast éteint). Plus large que sa durée de vie. */
export const TOAST_LIFETIME_TIMEOUT = 10_000

/** Email unique par run, pour que deux exécutions de la suite ne butent pas sur
 * l'unicité imposée par le backend (signup). */
export function uniqueEmail(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}@test.dev`
}

/** Localise le champ de saisie associé à un libellé visible.
 *
 * `AuthTextField` (src/components/ui/AuthTextField.tsx) rend un vrai
 * `<label htmlFor>` relié à l'`<input>` par son id, donc on cible le champ par son
 * nom accessible : c'est ce que lit un lecteur d'écran. */
export function fieldByLabel(page: Page, label: string): Locator {
  return page.getByLabel(label, { exact: true })
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
