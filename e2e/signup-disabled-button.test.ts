import { test, expect } from '@playwright/test'
import { fieldByLabel } from './helpers'

test.describe('Bouton signup grisé (RM33)', () => {
  test('RM33 -- bouton grisé quand tous les champs sont vides', async ({
    page,
  }) => {
    await page.goto('/signup')

    await expect(
      page.getByRole('button', { name: 'Créer un compte' })
    ).toBeDisabled()
  })

  test('RM33 -- bouton grisé quand le prénom manque', async ({ page }) => {
    await page.goto('/signup')
    await fieldByLabel(page, 'Email*').fill('marc@test.dev')
    await fieldByLabel(page, 'Mot de passe*').fill('Password1234')

    await expect(
      page.getByRole('button', { name: 'Créer un compte' })
    ).toBeDisabled()
  })

  test('RM33 -- bouton grisé quand l\'email manque', async ({ page }) => {
    await page.goto('/signup')
    await fieldByLabel(page, 'Prénom*').fill('Marc')
    await fieldByLabel(page, 'Mot de passe*').fill('Password1234')

    await expect(
      page.getByRole('button', { name: 'Créer un compte' })
    ).toBeDisabled()
  })

  test('RM33 -- bouton grisé quand le mot de passe manque', async ({
    page,
  }) => {
    await page.goto('/signup')
    await fieldByLabel(page, 'Prénom*').fill('Marc')
    await fieldByLabel(page, 'Email*').fill('marc@test.dev')

    await expect(
      page.getByRole('button', { name: 'Créer un compte' })
    ).toBeDisabled()
  })

  test('RM33 -- bouton grisé quand le prénom ne contient que des espaces', async ({
    page,
  }) => {
    await page.goto('/signup')
    await fieldByLabel(page, 'Prénom*').fill('   ')
    await fieldByLabel(page, 'Email*').fill('marc@test.dev')
    await fieldByLabel(page, 'Mot de passe*').fill('Password1234')

    await expect(
      page.getByRole('button', { name: 'Créer un compte' })
    ).toBeDisabled()
  })

  test('RM33 -- bouton actif quand tous les champs sont remplis', async ({
    page,
  }) => {
    await page.goto('/signup')
    await fieldByLabel(page, 'Prénom*').fill('Marc')
    await fieldByLabel(page, 'Email*').fill('marc@test.dev')
    await fieldByLabel(page, 'Mot de passe*').fill('Password1234')

    await expect(
      page.getByRole('button', { name: 'Créer un compte' })
    ).toBeEnabled()
  })
})
