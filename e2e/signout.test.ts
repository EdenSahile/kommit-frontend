import { test, expect } from '@playwright/test'
import {
  API_BASE_URL,
  ARRIVAL_TOAST_PATTERN,
  SESSION_COOKIE_NAME,
  TOAST_ABSENCE_TIMEOUT,
  signUpViaUi,
  uniqueEmail,
} from './helpers'

test.describe('Signout', () => {
  test('CA5 -- déconnexion silencieuse : retour à l\'accueil non connecté', async ({
    page,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-signout'),
      password: 'Password1234',
    }
    await signUpViaUi(page, user)

    // Le toast d'arrivée est encore à l'écran : on se déconnecte AVANT qu'il
    // s'efface tout seul, sinon le test ne vérifie plus rien (RM5).
    await expect(page.getByText(/Bienvenue/)).toBeVisible()
    await page.getByRole('button', { name: 'Se déconnecter' }).click()

    await expect(
      page.getByText('Prêt(e) pour ton daily standup ?')
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Se connecter' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Créer un compte' })
    ).toBeVisible()

    // Ni modale de confirmation, ni toast d'arrivée. Fenêtre courte et volontaire :
    // 1,5s laisse passer l'animation de fermeture, mais reste très en deçà des
    // ~5,8s de vie d'un toast. Avec le délai par défaut de 5s, le toast mourrait
    // de vieillesse pendant l'attente et le test passerait même s'il avait
    // survécu à la déconnexion (RM5).
    await expect(page.getByText(/Bienvenue/)).toHaveCount(0, { timeout: 1500 })
    await expect(page.getByText(/Content de te revoir/)).toHaveCount(0, {
      timeout: 1500,
    })
    expect(await page.getByRole('dialog').count()).toBe(0)

    // Étape 2 de SM-15 : la session est fermée côté serveur, pas seulement oubliée
    // côté écran. Après un rechargement, l'accueil reste en état visiteur -- si le
    // cookie revenait, le titre connecté réapparaîtrait ici.
    await page.reload()

    await expect(
      page.getByText('Prêt(e) pour ton daily standup ?')
    ).toBeVisible()
    await expect(
      page.getByText(`Quoi de neuf aujourd'hui, ${user.name} ?`)
    ).toHaveCount(0)
  })

  test("RM31 (SM-16) -- session expirée : accueil non connecté et silencieux", async ({
    page,
    context,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-session-expiree'),
      password: 'Password1234',
    }
    await signUpViaUi(page, user)
    await expect(
      page.getByText(`Quoi de neuf aujourd'hui, ${user.name} ?`)
    ).toBeVisible()

    // Supprimer le cookie de session SIMULE l'expiration : côté front, une session
    // expirée et une session absente se lisent pareil (`Session` à null dans
    // src/types/apiContract.ts). Vérifier une vraie expiration par le temps
    // demanderait de raccourcir la durée de session côté backend, hors périmètre
    // de ce repo.
    const cookies = await context.cookies(API_BASE_URL)
    expect(
      cookies.map((cookie) => cookie.name),
      `le cookie ${SESSION_COOKIE_NAME} doit être posé avant de pouvoir expirer`
    ).toContain(SESSION_COOKIE_NAME)
    await context.clearCookies({ name: SESSION_COOKIE_NAME })

    await page.reload()

    await expect(
      page.getByText('Prêt(e) pour ton daily standup ?')
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Se connecter' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Créer un compte' })
    ).toBeVisible()

    // Aucun message d'expiration : ni toast, ni bandeau. Fenêtre courte, pour les
    // mêmes raisons qu'au-dessus.
    await expect(page.getByText(ARRIVAL_TOAST_PATTERN)).toHaveCount(0, {
      timeout: TOAST_ABSENCE_TIMEOUT,
    })
    await expect(page.getByText(/expir/i)).toHaveCount(0, {
      timeout: TOAST_ABSENCE_TIMEOUT,
    })
  })
})
