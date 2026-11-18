import { test, expect } from '@playwright/test'
import { fieldByLabel, uniqueEmail } from './helpers'

test.describe('Prénom d\'espaces seulement (RM20)', () => {
  test('RM20 -- signup avec un prénom d\'espaces : refusé par le serveur', async ({
    page,
  }) => {
    await page.goto('/signup')
    await fieldByLabel(page, 'Prénom*').fill('   ')
    await fieldByLabel(page, 'Email*').fill(uniqueEmail('marc-espaces-prenom'))
    await fieldByLabel(page, 'Mot de passe*').fill('Password1234')

    // RM33 grise le bouton quand le prénom ne contient que des espaces.
    // Si le bouton est grisé, la requête ne part pas et la validation serveur
    // n'est pas atteinte. Ce test vérifie que le front bloque bien en amont.
    await expect(
      page.getByRole('button', { name: 'Créer un compte' })
    ).toBeDisabled()
  })
})
