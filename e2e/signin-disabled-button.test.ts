import { test, expect } from '@playwright/test'
import { fieldByLabel } from './helpers'

test.describe('Bouton signin grisé (RM32)', () => {
  test('RM32 -- bouton grisé quand les 2 champs sont vides', async ({
    page,
  }) => {
    await page.goto('/signin')

    await expect(
      page.getByRole('button', { name: 'Me connecter' })
    ).toBeDisabled()
  })

  test('RM32 -- bouton grisé quand seul l\'email est rempli', async ({
    page,
  }) => {
    await page.goto('/signin')
    await fieldByLabel(page, 'Email').fill('marc@test.dev')

    await expect(
      page.getByRole('button', { name: 'Me connecter' })
    ).toBeDisabled()
  })

  test('RM32 -- bouton grisé quand seul le mot de passe est rempli', async ({
    page,
  }) => {
    await page.goto('/signin')
    await fieldByLabel(page, 'Mot de passe').fill('Password1234')

    await expect(
      page.getByRole('button', { name: 'Me connecter' })
    ).toBeDisabled()
  })

  test('RM32 -- bouton actif quand les 2 champs sont remplis', async ({
    page,
  }) => {
    await page.goto('/signin')
    await fieldByLabel(page, 'Email').fill('marc@test.dev')
    await fieldByLabel(page, 'Mot de passe').fill('Password1234')

    await expect(
      page.getByRole('button', { name: 'Me connecter' })
    ).toBeEnabled()
  })
})
