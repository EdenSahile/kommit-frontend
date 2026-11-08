import { test, expect } from '@playwright/test'
import { createAccountViaApi, fieldByLabel, uniqueEmail } from './helpers'

test.describe('Signin', () => {
  test('CA12 -- signin réussi : redirection vers l\'accueil connecté', async ({
    page,
    request,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-signin'),
      password: 'Password1234',
    }
    await createAccountViaApi(request, user)

    await page.goto('/signin')
    await fieldByLabel(page, 'Email').fill(user.email)
    await fieldByLabel(page, 'Mot de passe').fill(user.password)
    await page.getByRole('button', { name: 'Me connecter' }).click()

    await expect(page).toHaveURL('/')
    await expect(
      page.getByText(`Quoi de neuf aujourd'hui, ${user.name} ?`)
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Se déconnecter' })
    ).toBeVisible()
  })

  test('CA13 -- identifiants faux : message d\'erreur générique', async ({
    page,
    request,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-mauvais-mdp'),
      password: 'Password1234',
    }
    await createAccountViaApi(request, user)

    await page.goto('/signin')
    await fieldByLabel(page, 'Email').fill(user.email)
    await fieldByLabel(page, 'Mot de passe').fill('MauvaisMotDePasse1')
    await page.getByRole('button', { name: 'Me connecter' }).click()

    // Message du vrai backend pour INVALID_CREDENTIALS (vérifié en direct contre
    // http://localhost:3000) : générique, ne nomme ni l'email ni le mot de passe.
    // Le texte exact n'est pas fixé par src/types/apiContract.ts (ApiError.message
    // est un string libre) -- point signalé comme ambigu par testing/smokes-AUTH.md.
    const errorMessage = page.getByText('Email ou mot de passe incorrect')
    await expect(errorMessage).toBeVisible()
    await expect(page).toHaveURL('/signin')
  })

  test('CA17 -- pendant l\'appel API, le bouton est désactivé', async ({
    page,
    request,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-loading'),
      password: 'Password1234',
    }
    await createAccountViaApi(request, user)

    // Ralentit la réponse réelle du backend (le vrai serveur répond quand même)
    // pour pouvoir observer l'état intermédiaire du bouton.
    await page.route('**/api/auth/sign-in/email', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.continue()
    })

    await page.goto('/signin')
    await fieldByLabel(page, 'Email').fill(user.email)
    await fieldByLabel(page, 'Mot de passe').fill(user.password)

    await page.getByRole('button', { name: 'Me connecter' }).click()

    // Pendant l'appel, le libellé laisse place au spinner (RM17) : le nom
    // accessible du bouton devient « Connexion en cours », d'où ce second
    // locator. Le spinner lui-même est couvert par le test suivant ; ici on ne
    // vérifie que la désactivation.
    await expect(
      page.getByRole('button', { name: 'Connexion en cours' })
    ).toBeDisabled()

    await expect(page).toHaveURL('/')
  })

  // Le reste de RM17 (SM-7) : spinner à la place du libellé, et « Connexion en
  // cours » annoncé aux lecteurs d'écran sans être affiché.
  test(
    'RM17 (SM-7) -- spinner et texte aria pendant l\'appel',
    async ({ page, request }) => {
      const user = {
        name: 'Marc',
        email: uniqueEmail('marc-spinner'),
        password: 'Password1234',
      }
      await createAccountViaApi(request, user)

      await page.route('**/api/auth/sign-in/email', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 500))
        await route.continue()
      })

      await page.goto('/signin')
      await fieldByLabel(page, 'Email').fill(user.email)
      await fieldByLabel(page, 'Mot de passe').fill(user.password)

      const submitButton = page.getByRole('button', { name: 'Me connecter' })
      await submitButton.click()

      // Le libellé visible a laissé place au spinner...
      await expect(page.getByText('Me connecter', { exact: true })).toHaveCount(0)
      // ...et le texte d'attente est annoncé aux lecteurs d'écran, donc porté par
      // le nom accessible du bouton.
      //
      // NOTE : « présent mais invisible à l'œil » n'est pas assertable de façon
      // fiable ici. Un texte en `sr-only` garde une boîte de 1px, que Playwright
      // compte comme visible : `toBeHidden` échouerait sur un code pourtant
      // correct. Cette moitié de SM-7 reste à l'inspecteur d'accessibilité, à la
      // main.
      await expect(
        page.getByRole('button', { name: 'Connexion en cours' })
      ).toBeDisabled()

      await expect(page).toHaveURL('/')
    }
  )

  test('CA16 -- double-clic : une seule requête envoyée', async ({
    page,
    request,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-doubleclic'),
      password: 'Password1234',
    }
    await createAccountViaApi(request, user)

    let requestCount = 0
    await page.route('**/api/auth/sign-in/email', async (route) => {
      requestCount++
      await new Promise((resolve) => setTimeout(resolve, 400))
      await route.continue()
    })

    await page.goto('/signin')
    await fieldByLabel(page, 'Email').fill(user.email)
    await fieldByLabel(page, 'Mot de passe').fill(user.password)

    const submitButton = page.getByRole('button', { name: 'Me connecter' })
    await submitButton.dblclick()

    await expect(page).toHaveURL('/')
    expect(requestCount).toBe(1)
  })
})
