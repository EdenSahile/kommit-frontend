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
    await expect(
      page.getByRole('button', { name: 'Se déconnecter' })
    ).toBeVisible()

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

    // Ni modale de confirmation, ni toast d'arrivée.
    await expect(page.getByText(/Bienvenue/)).toHaveCount(0)
    await expect(page.getByText(/Content de te revoir/)).toHaveCount(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)
  })
})
