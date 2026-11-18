import { test, expect } from '@playwright/test'
import { createAccountViaApi, fieldByLabel, uniqueEmail } from './helpers'

test.describe('Unicité email insensible à la casse et aux espaces (RM21)', () => {
  test('RM21 -- signup avec le même email en majuscules : refusé', async ({
    page,
    request,
  }) => {
    const email = uniqueEmail('marc-casse')
    await createAccountViaApi(request, {
      name: 'Marc',
      email,
      password: 'Password1234',
    })

    await page.goto('/signup')
    await fieldByLabel(page, 'Prénom*').fill('Marc')
    await fieldByLabel(page, 'Email*').fill(email.toUpperCase())
    await fieldByLabel(page, 'Mot de passe*').fill('Password1234')
    await page.getByRole('button', { name: 'Créer un compte' }).click()

    await expect(page.getByText('Cet email est déjà utilisé')).toBeVisible()
    await expect(page).toHaveURL('/signup')
  })

  test('RM21 -- signup avec le même email entouré d\'espaces : refusé', async ({
    page,
    request,
  }) => {
    const email = uniqueEmail('marc-espaces')
    await createAccountViaApi(request, {
      name: 'Marc',
      email,
      password: 'Password1234',
    })

    await page.goto('/signup')
    await fieldByLabel(page, 'Prénom*').fill('Marc')
    await fieldByLabel(page, 'Email*').fill(`  ${email}  `)
    await fieldByLabel(page, 'Mot de passe*').fill('Password1234')
    await page.getByRole('button', { name: 'Créer un compte' }).click()

    await expect(page.getByText('Cet email est déjà utilisé')).toBeVisible()
    await expect(page).toHaveURL('/signup')
  })
})
