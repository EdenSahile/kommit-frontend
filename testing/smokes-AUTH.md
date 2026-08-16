# Smokes -- KOM-07 (Authentification frontend)

Scenarios ecrits **avant** l'implementation du branchement reel (session, appels API,
etats de chargement, redirections). Le code UI (write-ui) est deja en place ; ces
scenarios decrivent le comportement **attendu** du ticket -- ils vont echouer tant que
le branchement n'est pas fait, et c'est normal pour du test-first. Apres le code,
`e2e-test-writer` les transcrit en Playwright.

Perimetre : les CA marques :red_circle: de `testing/inventaire-AUTH.md`, plus le
complement smoke des CA :orange_circle:. Le detail de "ce qu'on verifie" et le
"pourquoi smoke" viennent de l'inventaire et du contrat d'API
(`src/types/apiContract.ts`).

> **Doctrine de format absente.** `docs/workflow-frontend.md` existe mais est vide dans
> ce repo -- pas de section "Format des smokes" a suivre telle quelle. Le format
> ci-dessous reprend le modele donne dans les instructions de l'agent smoke-test-writer
> (etapes numerotees, une action par ligne, cible par libelle visible, resultat
> observable, case a cocher).

> **Compte de test utilise dans les scenarios ci-dessous** : email
> `marc@kommit-test.dev`, mot de passe `Password1234`, prenom `Marc`. Sauf precision
> contraire, ce compte est suppose deja cree (par exemple via le scenario CA8) avant de
> jouer un scenario qui a besoin d'un compte existant.

---

## Page d'accueil

| CA | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| CA1 | :red_circle: | L'accueil affiche un message d'accueil et les boutons "Se connecter" / "Creer un compte" quand le visiteur n'est pas connecte | CA1 |
| CA2 | :red_circle: | L'accueil affiche "Quoi de neuf aujourd'hui, {prenom} ?" quand l'utilisateur est connecte | CA2 |
| CA15 | :red_circle: | Le clic sur "ViDev" dans le footer ouvre la chaine YouTube dans un nouvel onglet | CA15 |

### CA1 -- Accueil visiteur non connecte : message et boutons du header

> ✅ **Ce qu'on verifie :**
> - Le rendu HTML de l'accueil et la presence des boutons dans le header, quand personne n'est connecte.
> - Ca passe par un smoke car c'est un rendu navigateur + React, pas une fonction pure isolable.

Precondition : dev server lance (`pnpm dev`), aucun utilisateur connecte (pas de session), page `/` ouverte.

1. Ouvrir la page d'accueil (`/`).

Attendu : le titre "Pret(e) pour ton daily standup ?" s'affiche, et le header affiche les deux boutons "Se connecter" et "Creer un compte" (aucun bouton "Se deconnecter").

- [ ] Verifie

---

### CA2 -- Accueil utilisateur connecte : texte personnalise avec le prenom

> ✅ **Ce qu'on verifie :**
> - Le texte personnalise avec le prenom de la session s'affiche a l'accueil quand l'utilisateur est connecte.
> - Ca passe par un smoke car ca combine le rendu navigateur et la reponse reelle de l'API session (pas testable en fonction pure).

Precondition : dev server lance, backend lance, l'utilisateur "Marc" (`marc@kommit-test.dev` / `Password1234`) vient de se connecter (session active -- cf. scenario CA12), page d'accueil (`/`) ouverte.

1. Ouvrir (ou recharger) la page d'accueil (`/`).

Attendu : le titre "Quoi de neuf aujourd'hui, Marc ?" s'affiche, et le header affiche le bouton "Se deconnecter" (plus de boutons "Se connecter" / "Creer un compte").

- [ ] Verifie

---

### CA15 -- Lien "ViDev" du footer : ouverture en nouvel onglet

> ✅ **Ce qu'on verifie :**
> - Le clic sur "ViDev" ouvre la chaine YouTube dans un nouvel onglet (`target="_blank"`).
> - Ca passe par un smoke car c'est un comportement de navigation du navigateur, pas de la logique metier.

Precondition : dev server lance, page d'accueil (`/`) ouverte, visiteur non connecte.

1. Ouvrir la page d'accueil (`/`).
2. Cliquer sur le lien "ViDev" dans le footer.

Attendu : un nouvel onglet s'ouvre vers `https://www.youtube.com/@videv9858`, et l'onglet d'origine reste sur `/`.

- [ ] Verifie

---

## Navigation entre les pages

| CA | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| CA6 | :red_circle: | Le clic sur "Creer un compte" amene sur la page signup | CA6 |
| CA7 | :red_circle: | Le clic sur "Se connecter" amene sur la page signin | CA7 |

### CA6 -- Clic sur "Creer un compte" : navigation vers /signup

> ✅ **Ce qu'on verifie :**
> - La navigation entre routes declenchee par le bouton "Creer un compte" du header.
> - Ca passe par un smoke car c'est le comportement de React Router, pas une fonction pure.

Precondition : dev server lance, page d'accueil (`/`) ouverte, visiteur non connecte.

1. Cliquer sur le bouton "Creer un compte" dans le header.

Attendu : navigation vers `/signup`, la carte "Creer un compte" s'affiche avec les champs "Prenom*", "Email*" et "Mot de passe*".

- [ ] Verifie

---

### CA7 -- Clic sur "Se connecter" : navigation vers /signin

> ✅ **Ce qu'on verifie :**
> - La navigation entre routes declenchee par le bouton "Se connecter" du header.
> - Ca passe par un smoke car c'est le comportement de React Router, pas une fonction pure.

Precondition : dev server lance, page d'accueil (`/`) ouverte, visiteur non connecte.

1. Cliquer sur le bouton "Se connecter" dans le header.

Attendu : navigation vers `/signin`, la carte "Se connecter" s'affiche avec les champs "Email" et "Mot de passe".

- [ ] Verifie

---

## Formulaire d'authentification

| CA | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| -- (signin) | :green_circle: | Le bouton "Me connecter" est grise tant que les champs Email et Mot de passe sont vides | aucun smoke, couvert en unitaire |
| -- (signup) | :green_circle: | Le bouton "Creer un compte" est grise tant qu'un champ requis est vide | aucun smoke, couvert en unitaire |
| CA10, CA11, CA20 | :green_circle: | Validation a la soumission : prenom trime non vide, email bien forme, mot de passe >= 8 caracteres | aucun smoke, couvert en unitaire |
| CA30 | :red_circle: | La verification des champs se fait au moment de la soumission, pas a la saisie | CA30 |
| CA8, CA12 | :red_circle: | Apres un signup ou signin reussi, l'utilisateur est ramene sur l'accueil connecte | CA8, CA12 |
| CA17 | :red_circle: | Pendant l'appel API, le bouton est desactive, un spinner remplace le libelle, un texte aria est ajoute | CA17 |
| CA16 | :red_circle: | Un double-clic sur le bouton n'envoie qu'une seule requete | CA16 |
| CA9, CA13 | :orange_circle: | Le message d'erreur affiche depend du code renvoye par l'API (`EMAIL_ALREADY_EXISTS` / `INVALID_CREDENTIALS`) | CA9, CA13 |

### CA30 -- Validation au submit, pas a la saisie

> ✅ **Ce qu'on verifie :**
> - Les messages d'erreur de validation n'apparaissent qu'au clic sur le bouton de soumission, jamais pendant la frappe.
> - Ca passe par un smoke car le moment ou la validation se declenche depend du cablage react-hook-form et du rendu du formulaire, pas d'une fonction pure.

Precondition : dev server lance, page `/signup` ouverte.

1. Saisir "Marc" dans le champ "Prenom*".
2. Saisir "marc-sans-arobase" dans le champ "Email*" (format invalide, mais non vide).
3. Saisir "abc" dans le champ "Mot de passe*" (trop court, mais non vide).

Attendu (avant tout clic sur le bouton) : aucun message d'erreur ne s'affiche sous les champs, malgre les valeurs invalides.

4. Cliquer sur le bouton "Creer un compte".

Attendu (apres le clic) : un message d'erreur apparait sous le champ Email et sous le champ Mot de passe, et on reste sur `/signup` (aucune navigation). Le texte exact des messages est verifie en unitaire (CA10/CA11/CA20) -- ce smoke verifie seulement le *moment* ou ils apparaissent.

- [ ] Verifie

---

### CA8 -- Redirection vers l'accueil connecte apres un signup reussi

> ✅ **Ce qu'on verifie :**
> - Apres un signup reussi, l'utilisateur est ramene sur l'accueil, dans son etat connecte.
> - Ca passe par un smoke car c'est une redirection apres reponse API reelle -- React Router + backend, pas une fonction pure.

Precondition : dev server lance, backend lance, page `/signup` ouverte, email non deja utilise.

1. Saisir "Marc" dans le champ "Prenom*".
2. Saisir un email non utilise (ex. `marc.nouveau@kommit-test.dev`) dans le champ "Email*".
3. Saisir "Password1234" dans le champ "Mot de passe*".
4. Cliquer sur le bouton "Creer un compte".

Attendu : redirection vers `/`, la page affiche "Quoi de neuf aujourd'hui, Marc ?" et le header affiche le bouton "Se deconnecter".

- [ ] Verifie

---

### CA12 -- Redirection vers l'accueil connecte apres un signin reussi

> ✅ **Ce qu'on verifie :**
> - Apres un signin reussi, l'utilisateur est ramene sur l'accueil, dans son etat connecte.
> - Ca passe par un smoke car c'est une redirection apres reponse API reelle -- React Router + backend, pas une fonction pure.

Precondition : dev server lance, backend lance, un compte existe deja (`marc@kommit-test.dev` / `Password1234`, prenom "Marc"), utilisateur non connecte, page `/signin` ouverte.

1. Saisir "marc@kommit-test.dev" dans le champ "Email".
2. Saisir "Password1234" dans le champ "Mot de passe".
3. Cliquer sur le bouton "Me connecter".

Attendu : redirection vers `/`, la page affiche "Quoi de neuf aujourd'hui, Marc ?" et le header affiche le bouton "Se deconnecter".

- [ ] Verifie

---

### CA17 -- Etat de chargement du bouton pendant l'appel API

> ✅ **Ce qu'on verifie :**
> - Pendant l'appel API, le bouton est desactive, un spinner remplace le libelle, et un texte accessible ("Connexion en cours" / "Creation du compte en cours") est ajoute.
> - Ca passe par un smoke car c'est un rendu d'etat de chargement (spinner, attribut `aria`, `disabled`) -- comportement du navigateur et du composant, pas une fonction pure.

Precondition : dev server lance, backend lance, un compte existe deja (`marc@kommit-test.dev` / `Password1234`), page `/signin` ouverte.

1. Saisir "marc@kommit-test.dev" dans le champ "Email".
2. Saisir "Password1234" dans le champ "Mot de passe".
3. Cliquer sur le bouton "Me connecter".

Attendu : immediatement apres le clic, le bouton devient desactive, son libelle "Me connecter" est remplace par un spinner, et un texte accessible "Connexion en cours" est present pour les lecteurs d'ecran. Puis, une fois la reponse recue, redirection vers `/`. (Le pendant signup, avec "Creation du compte en cours", suit le meme mecanisme et n'est pas rejoue ici.)

- [ ] Verifie

---

### CA16 -- Double-clic : une seule requete envoyee

> ✅ **Ce qu'on verifie :**
> - Un double-clic sur le bouton de soumission n'envoie qu'une seule requete, grace au bouton desactive des le premier clic (meme mecanisme que CA17).
> - Ca passe par un smoke car c'est un comportement du navigateur (le `disabled` empeche le second clic), pas une fonction pure.

Precondition : dev server lance, backend lance, un compte existe deja (`marc@kommit-test.dev` / `Password1234`), page `/signin` ouverte.

1. Saisir "marc@kommit-test.dev" dans le champ "Email".
2. Saisir "Password1234" dans le champ "Mot de passe".
3. Double-cliquer rapidement sur le bouton "Me connecter".

Attendu : des le premier clic, le bouton "Me connecter" passe en etat desactive (le second clic n'a aucun effet), puis une seule redirection vers `/` se produit -- pas de double redirection, pas de message d'erreur lie a une double soumission.

- [ ] Verifie

---

### CA9 -- Signup avec un email deja utilise : message d'erreur

> ✅ **Ce qu'on verifie :**
> - Sur `EMAIL_ALREADY_EXISTS`, le message exact du contrat s'affiche a l'ecran.
> - Le mapping code -> message est teste en unitaire (fonction pure) ; ce smoke confirme que l'API renvoie bien ce code dans ce cas reel, et que le message atteint effectivement l'ecran (branchement API + rendu, pas testable en fonction pure seule).

Precondition : dev server lance, backend lance, un compte existe deja avec l'email `marc@kommit-test.dev`, page `/signup` ouverte.

1. Saisir "Marc" dans le champ "Prenom*".
2. Saisir "marc@kommit-test.dev" dans le champ "Email*" (email deja utilise).
3. Saisir "Password1234" dans le champ "Mot de passe*".
4. Cliquer sur le bouton "Creer un compte".

Attendu : le message "Un compte avec cet email existe deja" s'affiche a l'ecran (texte exact du commentaire CA9 dans `src/types/apiContract.ts`), et on reste sur `/signup` (aucune redirection).

- [ ] Verifie

---

### CA13 -- Signin avec des identifiants faux : message d'erreur generique

> ✅ **Ce qu'on verifie :**
> - Sur `INVALID_CREDENTIALS`, un message generique s'affiche, sans jamais dire si c'est l'email ou le mot de passe qui est faux.
> - Le mapping code -> message est teste en unitaire ; ce smoke confirme que l'API renvoie bien ce code sur des identifiants faux, et que le message atteint l'ecran.

Precondition : dev server lance, backend lance, un compte existe deja (`marc@kommit-test.dev` / `Password1234`), page `/signin` ouverte.

1. Saisir "marc@kommit-test.dev" dans le champ "Email".
2. Saisir "MauvaisMotDePasse1" dans le champ "Mot de passe" (mot de passe volontairement faux).
3. Cliquer sur le bouton "Me connecter".

Attendu : un message d'erreur generique s'affiche a l'ecran, qui ne precise ni que l'email est faux ni que le mot de passe est faux, et on reste sur `/signin` (aucune redirection).

> ⚠️ Le texte exact du message n'est **pas** fixe par `src/types/apiContract.ts` -- `ApiError.message` est un `string` libre rempli par le backend, seul le code `INVALID_CREDENTIALS` et l'exigence "generique, sans nommer le champ" sont contractuels. Ce point est a confirmer sur le ticket/board avant la transcription en e2e.

- [ ] Verifie

---

## Le toast d'arrivee

| CA | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| CA3, CA4 | :green_circle: | Apres signup : toast "Bienvenue {prenom}, ton compte est cree." ; apres signin : toast "Content de te revoir {prenom}." | aucun smoke, couvert en unitaire |
| CA24 | :green_circle: | Au reload ou retour navigateur, le toast ne reapparait pas | aucun smoke, couvert en unitaire |
| CA25 | :green_circle: | Ouverture directe de l'accueil avec session persistee : page personnalisee sans toast | aucun smoke, couvert en unitaire |

Aucun smoke pour ce paquet : les trois CA sont entierement decidables en fonction pure (flag de navigation a usage unique + prenom de session) et couverts en unitaire par `unit-test-writer`.

---

## Sign out

| CA | Inventaire | Ce qu'on verifie | Scenario |
|---|---|---|---|
| CA5 | :red_circle: | Le clic sur "Se deconnecter" ferme la session et repasse en accueil non connecte, sans modale ni toast | CA5 |

### CA5 -- Deconnexion silencieuse : retour a l'accueil non connecte

> ✅ **Ce qu'on verifie :**
> - Le clic sur "Se deconnecter" ferme la session, sans modale de confirmation ni toast, et repasse l'accueil en etat non connecte.
> - Ca passe par un smoke car la fermeture de session est un appel API backend reel, et le retour a l'etat non connecte est un rendu navigateur + React Router.

Precondition : dev server lance, backend lance, session active (utilisateur connecte, ex. suite au scenario CA12), page d'accueil connectee (`/`) ouverte.

1. Cliquer sur le bouton "Se deconnecter" dans le header.

Attendu : aucune modale de confirmation ne s'affiche, aucun toast n'apparait, et la page revient immediatement a l'accueil non connecte -- le header affiche a nouveau les boutons "Se connecter" et "Creer un compte", et le titre redevient "Pret(e) pour ton daily standup ?".

- [ ] Verifie
