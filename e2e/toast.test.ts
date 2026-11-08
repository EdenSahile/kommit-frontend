import { test, expect } from '@playwright/test'
import {
  ARRIVAL_TOAST_PATTERN,
  TOAST_ABSENCE_TIMEOUT,
  TOAST_LIFETIME_TIMEOUT,
  createAccountViaApi,
  signInViaUi,
  signUpViaUi,
  uniqueEmail,
} from './helpers'

// Transcription des smokes SM-11 à SM-14 de testing/smokes-KOM-07.md
// (RM3, RM4, RM24, RM25). Aucun de ces 4 scénarios n'avait d'e2e.
//
// Les 2 messages viennent de src/logic/auth/arrivalToast/arrivalToast.ts :
// « Bienvenue {prénom}, ton compte est créé. » avec point final après un signup,
// « Content de te revoir {prénom} » sans point final après un signin.
const SIGNUP_TOAST = 'Bienvenue Marc, ton compte est créé.'
const SIGNIN_TOAST = 'Content de te revoir Marc'
const HOME_TITLE = "Quoi de neuf aujourd'hui, Marc ?"

const PASSWORD = 'Password1234'

test.describe("Toast d'arrivée", () => {
  test('RM3 (SM-11) -- après un signup : toast « Bienvenue Marc, ton compte est créé. », qui disparaît tout seul', async ({
    page,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-toast-signup'),
      password: PASSWORD,
    }

    await signUpViaUi(page, user)

    // `exact` : le point final fait partie du message attendu, et le texte ne doit
    // pas être celui du signin.
    const toast = page.getByText(SIGNUP_TOAST, { exact: true })
    await expect(toast).toBeVisible()

    // C'est bien un toast éphémère posé par-dessus la page, pas un écran plein :
    // l'accueil connecté reste lisible dessous. La croix de fermeture est vérifiée
    // par le test suivant, qui doit survoler le toast pour l'atteindre -- or
    // survoler met en pause la disparition automatique, qu'on veut observer ici.
    await expect(page.getByText(HOME_TITLE)).toBeVisible()

    // Il s'efface de lui-même, sans aucune action. Attente volontairement large
    // (mort naturelle attendue, pas une absence à prouver).
    await expect(toast).toHaveCount(0, { timeout: TOAST_LIFETIME_TIMEOUT })
    await expect(page.getByText(HOME_TITLE)).toBeVisible()
  })

  test('RM3 (SM-11) -- clic sur la croix : le toast se ferme immédiatement', async ({
    page,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-toast-croix'),
      password: PASSWORD,
    }

    await signUpViaUi(page, user)

    const toast = page.getByText(SIGNUP_TOAST, { exact: true })
    await expect(toast).toBeVisible()

    // Il faut survoler le toast pour atteindre sa croix, comme à la souris : Base UI
    // laisse le bouton de fermeture `aria-hidden="true"` tant que la pile de toasts
    // n'est pas survolée ou focalisée, donc hors de l'arbre d'accessibilité, donc
    // introuvable par son rôle (mesuré : `aria-hidden` repasse à `false` au survol).
    //
    // NOTE : la croix porte le nom accessible « Close toast », en anglais, dans une
    // interface entièrement en français (src/components/ui/toast.tsx, ToastClose).
    // Le test suit le code réel ; l'anomalie est signalée dans le smoke SM-11.
    await toast.hover()
    await page.getByRole('button', { name: 'Close toast' }).click()

    // Fenêtre courte : elle prouve que c'est le clic qui a fermé le toast. Avec les
    // 5 s par défaut, le toast serait parti de lui-même avant la fin de l'attente et
    // le test passerait même si la croix ne faisait rien.
    await expect(toast).toHaveCount(0, { timeout: TOAST_ABSENCE_TIMEOUT })
    await expect(page.getByText(HOME_TITLE)).toBeVisible()
  })

  test('RM4 (SM-12) -- après un signin : toast « Content de te revoir Marc », sans point final', async ({
    page,
    request,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-toast-signin'),
      password: PASSWORD,
    }
    await createAccountViaApi(request, user)

    await signInViaUi(page, user)

    // `exact` rejette une variante avec point final : c'est le libellé arbitré le
    // 2026-11-05 en faveur de la maquette.
    await expect(page.getByText(SIGNIN_TOAST, { exact: true })).toBeVisible()

    // Le message du signup n'apparaît pas, alors que la réponse du serveur est la
    // même : c'est le front qui transporte la provenance.
    await expect(page.getByText(SIGNUP_TOAST, { exact: true })).toHaveCount(0, {
      timeout: TOAST_ABSENCE_TIMEOUT,
    })
  })

  test('RM24 (SM-13) -- rechargement puis retour/suivant navigateur : le toast ne réapparaît pas', async ({
    page,
    request,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-toast-reload'),
      password: PASSWORD,
    }
    await createAccountViaApi(request, user)

    await signInViaUi(page, user)

    // Le scénario commence toast éteint : on le voit apparaître, puis on le laisse
    // mourir de lui-même avant de recharger.
    const signinToast = page.getByText(SIGNIN_TOAST, { exact: true })
    await expect(signinToast).toBeVisible()
    await expect(signinToast).toHaveCount(0, {
      timeout: TOAST_LIFETIME_TIMEOUT,
    })

    await page.reload()

    await expect(page.getByText(HOME_TITLE)).toBeVisible()
    await expect(page.getByText(ARRIVAL_TOAST_PATTERN)).toHaveCount(0, {
      timeout: TOAST_ABSENCE_TIMEOUT,
    })

    // Retour, puis suivant : le signin a navigué côté client, donc l'historique
    // remonte sur /signin.
    await page.goBack()
    await expect(page).toHaveURL('/signin')

    await page.goForward()
    await expect(page).toHaveURL('/')
    await expect(page.getByText(HOME_TITLE)).toBeVisible()
    await expect(page.getByText(ARRIVAL_TOAST_PATTERN)).toHaveCount(0, {
      timeout: TOAST_ABSENCE_TIMEOUT,
    })
  })

  test("RM25 (SM-14) -- session persistée, ouverture directe de l'accueil : aucun toast", async ({
    page,
    context,
    request,
  }) => {
    const user = {
      name: 'Marc',
      email: uniqueEmail('marc-toast-persiste'),
      password: PASSWORD,
    }
    await createAccountViaApi(request, user)

    // Session réellement posée par un signin, toast d'arrivée vu dans cet onglet.
    await signInViaUi(page, user)
    await expect(page.getByText(SIGNIN_TOAST, { exact: true })).toBeVisible()

    // Un nouvel onglet du même navigateur : il partage les cookies (donc la
    // session), mais pas le `sessionStorage`, qui est propre à chaque onglet. C'est
    // exactement la situation de RM25 : arriver sur l'accueil sans passer par
    // signin ni signup.
    const newTab = await context.newPage()
    await newTab.goto('/')

    await expect(newTab.getByText(HOME_TITLE)).toBeVisible()
    await expect(
      newTab.getByRole('button', { name: 'Se déconnecter' })
    ).toBeVisible()
    await expect(newTab.getByText(ARRIVAL_TOAST_PATTERN)).toHaveCount(0, {
      timeout: TOAST_ABSENCE_TIMEOUT,
    })

    await newTab.close()
  })
})
