import { test, expect } from '@playwright/test'
import { signUpViaUi, uniqueEmail } from './helpers'

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
  })
})
