import { test, expect } from '@playwright/test'

test.describe('Navigation entre les pages', () => {
  test('CA6 -- clic sur "Créer un compte" : navigation vers /signup', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Créer un compte' }).click()

    await expect(page).toHaveURL('/signup')
    await expect(
      page.getByRole('heading', { name: 'Créer un compte' })
    ).toBeVisible()
    await expect(page.getByText('Prénom*', { exact: true })).toBeVisible()
    await expect(page.getByText('Email*', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Mot de passe*', { exact: true })
    ).toBeVisible()
  })

  test('CA7 -- clic sur "Se connecter" : navigation vers /signin', async ({
    page,
  }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Se connecter' }).click()

    await expect(page).toHaveURL('/signin')
    await expect(
      page.getByRole('heading', { name: 'Se connecter' })
    ).toBeVisible()
    await expect(page.getByText('Email', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Mot de passe', { exact: true })
    ).toBeVisible()
  })
})
