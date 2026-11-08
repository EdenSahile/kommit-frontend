import { test, expect } from '@playwright/test'
import { createAccountViaApi, fieldByLabel, uniqueEmail } from './helpers'

test.describe('Signup', () => {
  test('CA8 -- signup réussi : redirection vers l\'accueil connecté', async ({
    page,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-signup'),
      password: 'Password1234',
    }

    await page.goto('/signup')
    await fieldByLabel(page, 'Prénom*').fill(user.name)
    await fieldByLabel(page, 'Email*').fill(user.email)
    await fieldByLabel(page, 'Mot de passe*').fill(user.password)
    await page.getByRole('button', { name: 'Créer un compte' }).click()

    await expect(page).toHaveURL('/')
    await expect(
      page.getByText(`Quoi de neuf aujourd'hui, ${user.name} ?`)
    ).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Se déconnecter' })
    ).toBeVisible()
  })

  test('CA30 -- validation au submit, pas à la saisie', async ({ page }) => {
    await page.goto('/signup')

    await fieldByLabel(page, 'Prénom*').fill('Marc')
    await fieldByLabel(page, 'Email*').fill('marc-sans-arobase')
    await fieldByLabel(page, 'Mot de passe*').fill('abc')

    // Avant tout clic sur le bouton : aucun message d'erreur, malgré les valeurs
    // invalides déjà saisies.
    await expect(
      page.getByText('Adresse email invalide.')
    ).toHaveCount(0)
    await expect(
      page.getByText('Le mot de passe doit contenir au moins 8 caractères.')
    ).toHaveCount(0)

    await page.getByRole('button', { name: 'Créer un compte' }).click()

    // Après le clic : les messages apparaissent sous les champs concernés, et on
    // reste sur /signup (le texte exact est vérifié en unitaire, CA10/CA11/CA20).
    //
    // Le <form> de SignupPage a `noValidate` : sans ça, la validation HTML5 native
    // du navigateur sur <input type="email"> bloquerait l'événement `submit` avant
    // que handleSubmit ne s'exécute, empêchant l'affichage des messages custom.
    await expect(page.getByText('Adresse email invalide.')).toBeVisible()
    await expect(
      page.getByText('Le mot de passe doit contenir au moins 8 caractères.')
    ).toBeVisible()
    await expect(page).toHaveURL('/signup')

    // Étape 3 de SM-6 : après la 1re soumission, les messages se mettent à jour
    // pendant la saisie. Corriger l'email fait partir SON message, et seulement le
    // sien : celui du mot de passe reste, puisque le mot de passe n'a pas été
    // corrigé. C'est l'ORDRE que RM30 exige (rien, puis au submit, puis à la
    // saisie) ; le texte exact des messages est vérifié en unitaire.
    await fieldByLabel(page, 'Email*').fill('marc@kommit-test.dev')

    await expect(page.getByText('Adresse email invalide.')).toHaveCount(0)
    await expect(
      page.getByText('Le mot de passe doit contenir au moins 8 caractères.')
    ).toBeVisible()
    await expect(page).toHaveURL('/signup')
  })

  test('CA9 -- signup avec un email déjà utilisé : message d\'erreur', async ({
    page,
    request,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-existant'),
      password: 'Password1234',
    }
    await createAccountViaApi(request, user)

    await page.goto('/signup')
    await fieldByLabel(page, 'Prénom*').fill('Marc')
    await fieldByLabel(page, 'Email*').fill(user.email)
    await fieldByLabel(page, 'Mot de passe*').fill('Password1234')
    await page.getByRole('button', { name: 'Créer un compte' }).click()

    // NOTE : le texte du commentaire CA9 dans src/types/apiContract.ts et le smoke
    // (testing/smokes-AUTH.md) donnent « Un compte avec cet email existe déjà »,
    // mais le vrai backend renvoie « Cet email est déjà utilisé » (vérifié en direct
    // contre http://localhost:3000). On suit le code réel exécuté par le test.
    await expect(page.getByText('Cet email est déjà utilisé')).toBeVisible()
    await expect(page).toHaveURL('/signup')
  })
})
