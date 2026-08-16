import { test, expect } from '@playwright/test'
import { signUpViaUi, uniqueEmail } from './helpers'

test.describe('Accueil', () => {
  test('CA1 -- visiteur non connecté : message et boutons du header', async ({
    page,
  }) => {
    await page.goto('/')

    await expect(
      page.getByText('Prêt(e) pour ton daily standup ?')
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Se connecter' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Créer un compte' })
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Se déconnecter' })
    ).toHaveCount(0)
  })

  test('CA2 -- utilisateur connecté : texte personnalisé avec le prénom', async ({
    page,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-accueil'),
      password: 'Password1234',
    }

    // Le signup redirige déjà vers l'accueil connecté (CA8) -- on recharge la page
    // pour vérifier que le texte personnalisé s'affiche bien à l'ouverture (CA2).
    await signUpViaUi(page, user)
    await page.reload()

    await expect(
      page.getByText(`Quoi de neuf aujourd'hui, ${user.name} ?`)
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Se déconnecter' })
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Se connecter' })
    ).toHaveCount(0)
    await expect(
      page.getByRole('link', { name: 'Créer un compte' })
    ).toHaveCount(0)
  })

  test('CA15 -- clic sur "ViDev" dans le footer : ouverture en nouvel onglet', async ({
    page,
    context,
  }) => {
    await page.goto('/')

    const link = page.getByRole('link', { name: 'ViDev' })
    // La cible du lien : ce que l'app contrôle réellement.
    await expect(link).toHaveAttribute(
      'href',
      'https://www.youtube.com/@videv9858'
    )
    await expect(link).toHaveAttribute('target', '_blank')

    // Le clic ouvre bien un nouvel onglet, et l'onglet d'origine reste sur /.
    // NOTE : on ne vérifie pas l'URL finale du nouvel onglet -- YouTube
    // redirige immédiatement vers une page de consentement cookies
    // (consent.youtube.com) en environnement sandboxé/headless, ce qui est un
    // comportement de YouTube, pas de l'app.
    await Promise.all([
      context.waitForEvent('page'),
      link.click(),
    ])
    await expect(page).toHaveURL('/')
  })
})
