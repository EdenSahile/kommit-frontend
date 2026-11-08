# Smokes, KOM-07 « Authentification · frontend »

Ticket : [Authentification · frontend](https://app.notion.com/p/87be39355d30820b8caf0158b9940f94), `Ticket ID` = KOM-07.
Inventaire de référence : `testing/inventaire-KOM-07.md`. Les sections, les lignes et leur
ordre sont ceux de l'inventaire, pour que les 2 fichiers se lisent côte à côte.
Format appliqué : `docs/testing-strategy.md`, section « Format des smokes ».
Contrat d'API lu : `src/types/apiContract.ts`.

Périmètre : les RM 🔴 de l'inventaire, plus le complément smoke des RM 🟠. La part unitaire
des 🟠 et les 🟢 appartiennent à `unit-test-writer` : ils figurent quand même dans les
tableaux récap, colonne Scénario « aucun smoke, couvert en unitaire », pour que la
correspondance avec l'inventaire soit complète.

## 4 choses à savoir avant de jouer ces scénarios

1. **Le ticket est déjà implémenté.** Ce n'est pas du test-first : ces scénarios décrivent un
   comportement qui existe et qu'on peut aller voir dans le navigateur. Les libellés et les
   messages attendus ci-dessous ont été relus dans le code (`src/data/`, `src/logic/auth/`)
   et dans le contrat d'API, pas supposés.
2. **Tous les scénarios sont transcrits en e2e Playwright** depuis le 2026-11-05 (19 tests
   dans `e2e/`, plus 1 `test.fixme` pour la part de SM-7 qui n'est pas dans le code). Chaque
   scénario indique s'il est déjà couvert et par quel fichier, sous la forme
   « 🤖 Déjà en e2e : … » ou « 🖐️ Pas d'e2e : à jouer à la main ». Inutile de rejouer à la
   main ce qui tourne tout seul : le smoke reste la source en langage humain, l'e2e est sa
   transcription.
3. **1 seul scénario échoue encore aujourd'hui, et c'est connu** : SM-7 (RM17, spinner et
   texte aria absents du code, suivi dans KOM-29). La position du toast, qui faisait échouer
   SM-11 et SM-12, a été corrigée depuis (commit 8434975) : le toast sort bien en haut à
   droite. Le détail est dans l'encadré de chaque scénario.
4. **2 libellés ont été arbitrés le 2026-11-05 en faveur de la maquette**, et le ticket Notion
   a été corrigé : le titre de l'accueil connecté est « Quoi de neuf aujourd'hui, {prénom} ? »
   et le toast de reconnexion est « Content de te revoir {prénom} », sans point final. La note
   « libellé à arbitrer » de RM2 dans l'inventaire est périmée. Ticket, maquette, code et e2e
   disent la même chose.

## Préconditions communes

Sauf précision contraire, chaque scénario suppose :

- le dev server lancé (`pnpm dev`, front sur `http://localhost:5173`) ;
- le backend lancé (`http://localhost:3000`) pour tout scénario qui touche une session, un
  compte ou un appel d'API ;
- **un compte de test** : prénom `Marc`, email `marc@kommit-test.dev`, mot de passe
  `Password1234`. Les scénarios de signup utilisent à chaque passage un email **neuf**
  (ex. `marc+2026-11-05@kommit-test.dev`), sinon le 2e passage tombe sur
  `EMAIL_ALREADY_EXISTS` au lieu du cas de succès.

---

## 1. Page d'accueil

| RM | Inventaire | Ce qu'on vérifie | Scénario |
|---|---|---|---|
| RM1 | 🔴 | Accueil visiteur non connecté : message d'accueil et boutons « Se connecter » / « Créer un compte » dans le header | SM-1 |
| RM2 | 🟠 | Accueil connecté : le corps affiche « Quoi de neuf aujourd'hui, {prénom} ? » | SM-2 (complément smoke) |
| RM15 | 🔴 | « ViDev » dans le footer ouvre la chaîne YouTube dans un nouvel onglet | SM-3 |

### SM-1 (RM1) — Accueil visiteur non connecté : message et boutons du header

> ✅ **Ce qu'on vérifie :**
> - Le message d'accueil « Prêt(e) pour ton daily standup ? » s'affiche.
> - Le header montre « Se connecter » et « Créer un compte », et aucun bouton « Se déconnecter ».
> - Pourquoi un smoke : c'est le rendu réel d'un contenu largement statique, affiché **après**
>   la lecture d'une session réellement absente. Un test unitaire ne vérifierait que notre
>   propre constante de texte.

Précondition : dev server et backend lancés, aucune session ouverte (navigation privée, ou
cookie de session supprimé).

1. Ouvrir la page `/`.

Attendu : le titre « Prêt(e) pour ton daily standup ? » et le sous-titre « Track tes résultats
pour que les jours ne se ressemblent pas. » s'affichent. Le header montre les 2 liens
« Se connecter » et « Créer un compte ». Aucun bouton « Se déconnecter » n'est présent.

🤖 Déjà en e2e : `e2e/home.test.ts`, test « CA1 ».

- [ ] Vérifié

---

### SM-2 (RM2) — Accueil connecté : titre personnalisé avec le prénom

> ✅ **Ce qu'on vérifie :**
> - Avec une session réelle, le corps de l'accueil affiche « Quoi de neuf aujourd'hui, Marc ? ».
> - Le header montre « Se déconnecter » à la place des 2 boutons du visiteur.
> - Pourquoi un smoke : composer le titre à partir du `name` de la session est une fonction
>   pure, déjà couverte en unitaire. Que ce titre s'affiche réellement suppose une session
>   réellement posée, donc le cookie cross-origin et `credentials: 'include'`, ce qui ne
>   s'observe que dans un navigateur.

Précondition : dev server et backend lancés, session ouverte avec le compte `Marc` (par
exemple à l'issue de SM-10).

1. Ouvrir la page `/`.

Attendu : le titre « Quoi de neuf aujourd'hui, Marc ? » s'affiche, avec le prénom et le « ? »
en couleur d'accent, suivi du sous-titre « Renseigne ton daily du jour ci-dessous. ». Le header
montre le bouton « Se déconnecter », et plus aucun lien « Se connecter » ni « Créer un compte ».

🤖 Déjà en e2e : `e2e/home.test.ts`, test « CA2 ».

- [ ] Vérifié

---

### SM-3 (RM15) — Lien « ViDev » du footer : ouverture dans un nouvel onglet

> ✅ **Ce qu'on vérifie :**
> - Le clic sur « ViDev » dans le footer ouvre `https://www.youtube.com/@videv9858` dans un
>   **nouvel** onglet, et l'onglet d'origine reste sur `/`.
> - Pourquoi un smoke : l'ouverture d'un nouvel onglet est un comportement du navigateur.
>   Vérifier en unitaire qu'un attribut vaut `_blank` ne prouve pas que l'onglet s'ouvre.

Précondition : dev server lancé, page `/` ouverte, visiteur non connecté.

1. Cliquer sur le lien « ViDev » dans le footer (texte « Créé par ViDev »).

Attendu : un nouvel onglet s'ouvre sur la chaîne YouTube `@videv9858`, et l'onglet d'origine
est toujours sur `/`, inchangé.

> ℹ️ En automatisé, l'URL finale du nouvel onglet n'est pas vérifiée : YouTube redirige vers
> une page de consentement aux cookies (`consent.youtube.com`), ce qui est un comportement de
> YouTube, pas de l'application. À la main, atterrir sur cette page de consentement compte
> comme un succès.

🤖 Déjà en e2e : `e2e/home.test.ts`, test « CA15 ».

- [ ] Vérifié

---

## 2. Navigation entre les pages

| RM | Inventaire | Ce qu'on vérifie | Scénario |
|---|---|---|---|
| RM6 | 🔴 | Clic sur « Créer un compte » : on arrive sur la page de signup | SM-4 |
| RM7 | 🔴 | Clic sur « Se connecter » : on arrive sur la page de signin | SM-5 |

### SM-4 (RM6) — Clic sur « Créer un compte » : arrivée sur la page de signup

> ✅ **Ce qu'on vérifie :**
> - Le clic sur « Créer un compte » dans le header mène à `/signup`, et la page de création de
>   compte s'affiche avec ses 3 champs.
> - Pourquoi un smoke : c'est React Router qui navigue. Ce qu'on vérifie est le branchement
>   d'une librairie, pas une décision à nous.

Précondition : dev server lancé, page `/` ouverte, visiteur non connecté.

1. Cliquer sur le lien « Créer un compte » dans le header.

Attendu : l'URL devient `/signup`, le titre « Créer un compte » s'affiche dans la carte, avec
les champs « Prénom* », « Email* » et « Mot de passe* » (pas de champ de confirmation de mot
de passe) et le bouton « Créer un compte ».

🤖 Déjà en e2e : `e2e/navigation.test.ts`, test « CA6 ».

- [ ] Vérifié

---

### SM-5 (RM7) — Clic sur « Se connecter » : arrivée sur la page de signin

> ✅ **Ce qu'on vérifie :**
> - Le clic sur « Se connecter » dans le header mène à `/signin`, et la page de connexion
>   s'affiche avec ses 2 champs.
> - Pourquoi un smoke : même raison que SM-4, c'est la navigation de React Router.

Précondition : dev server lancé, page `/` ouverte, visiteur non connecté.

1. Cliquer sur le lien « Se connecter » dans le header.

Attendu : l'URL devient `/signin`, le titre « Se connecter » s'affiche dans la carte, avec les
champs « Email » et « Mot de passe » (sans astérisque, contrairement au signup) et le bouton
« Me connecter ».

🤖 Déjà en e2e : `e2e/navigation.test.ts`, test « CA7 ».

- [ ] Vérifié

---

## 3. Formulaire d'authentification

| RM | Inventaire | Ce qu'on vérifie | Scénario |
|---|---|---|---|
| RM32 | 🟢 | Signin : « Me connecter » grisé tant que les champs sont vides, aucune requête ne part | aucun smoke, couvert en unitaire |
| RM33 | 🟢 | Signup : « Créer un compte » grisé tant qu'un champ requis est vide, prénom d'espaces compté comme vide | aucun smoke, couvert en unitaire |
| RM10, RM11, RM20 | 🟢 | Signup : prénom trimé non vide, email bien formé, mot de passe ≥ 8. Signin : aucun format vérifié | aucun smoke, couvert en unitaire |
| RM30 | 🟠 | Signup : les erreurs de format apparaissent à la 1re soumission, puis se mettent à jour pendant la saisie | SM-6 (complément smoke) |
| RM17 | 🟠 | Appel en cours : bouton désactivé, libellé remplacé par un spinner, texte aria présent mais invisible | SM-7 (complément smoke) |
| RM16 | 🔴 | Double-clic sur le bouton : une seule requête part | SM-8 |
| RM9, RM13 | 🟢 | Message choisi d'après le `code` de l'`ApiError` (`EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`) | aucun smoke, couvert en unitaire |
| RM8, RM12 | 🔴 | Signup ou signin réussi : l'utilisateur est ramené sur l'accueil, connecté | SM-9 (signup), SM-10 (signin) |

### SM-6 (RM30) — Signup : les erreurs apparaissent à la soumission, puis se corrigent à la saisie

> ✅ **Ce qu'on vérifie :**
> - Avant toute soumission, aucun message d'erreur n'est affiché, même avec des valeurs
>   invalides déjà saisies.
> - Les messages apparaissent au clic sur « Créer un compte ».
> - Ils se mettent à jour pendant la saisie qui suit : corriger un champ fait disparaître son
>   message.
> - Pourquoi un smoke : la tranche à nous est le **moment** (« faut-il afficher les erreurs
>   maintenant ? »), déjà couverte en unitaire. Que le message apparaisse puis se corrige à
>   l'écran dans cet ordre est du rendu réel.

Précondition : dev server lancé, page `/signup` ouverte.

1. Saisir « Marc » dans le champ « Prénom* », « marc-sans-arobase » dans le champ « Email* »,
   et « abc » dans le champ « Mot de passe* ».

Attendu à ce stade : aucun message d'erreur sous les champs, malgré l'email mal formé et le mot
de passe trop court.

2. Cliquer sur le bouton « Créer un compte ».

Attendu à ce stade : « Adresse email invalide. » s'affiche sous le champ Email,
« Le mot de passe doit contenir au moins 8 caractères. » s'affiche sous le champ Mot de passe,
et on reste sur `/signup` (aucune navigation).

3. Saisir « marc@kommit-test.dev » dans le champ « Email* ».

Attendu : le message « Adresse email invalide. » disparaît pendant la saisie, tandis que
« Le mot de passe doit contenir au moins 8 caractères. » reste affiché sous le champ Mot de
passe (il n'a pas été corrigé).

> ⚠️ Scénario à 3 étapes avec 3 points d'observation : c'est la limite haute de ce qu'un smoke
> doit contenir. Il n'est pas découpable sans perdre ce que RM30 exige, à savoir l'**ordre**
> (rien, puis au submit, puis pendant la saisie).
>
> ℹ️ Le texte exact des messages est vérifié en unitaire (RM10, RM11, RM20). Ce smoke porte sur
> le moment où ils apparaissent et disparaissent.

🤖 Déjà en e2e : `e2e/signup.test.ts`, test « CA30 », **en entier** depuis le 2026-11-05 :
l'étape 3 (la mise à jour pendant la saisie) y a été ajoutée. Rien ne reste à jouer à la main.

- [ ] Vérifié

---

### SM-7 (RM17) — Appel en cours : bouton désactivé, spinner, texte aria non visible

> ✅ **Ce qu'on vérifie :**
> - Pendant l'appel de signin, le bouton « Me connecter » est désactivé.
> - Son libellé est remplacé par un spinner de chargement.
> - Le texte « Connexion en cours » est annoncé aux lecteurs d'écran sans être visible à l'écran.
> - Pourquoi un smoke : « appel en cours → bouton désactivé » est une décision d'état à nous,
>   déjà couverte en unitaire. Le spinner, et surtout le fait qu'un texte soit annoncé sans
>   être visible, dépendent du rendu réel et du CSS calculé.

> 🔴 **Ce scénario échoue aujourd'hui, c'est connu et suivi dans KOM-29.** RM17 n'est
> implémenté qu'à moitié : `src/components/ui/AuthSubmitButton.tsx` ne gère que l'attribut
> `disabled` et affiche son libellé en clair. Il n'y a **ni spinner ni texte aria**. Concrètement :
> l'étape 3 passe sur « le bouton est désactivé », et échoue sur « le libellé est remplacé par
> un spinner » comme sur « Connexion en cours est annoncé ». Le scénario est écrit complet,
> tel que le ticket décrit RM17, pour servir de cible quand KOM-29 sera traité. Ne pas le
> raboter au comportement actuel : ce serait perdre la trace de ce qui manque.

Précondition : dev server et backend lancés, compte `marc@kommit-test.dev` existant, page
`/signin` ouverte. Pour avoir le temps d'observer l'état intermédiaire, brider le réseau dans
les outils de développement du navigateur (onglet Réseau, throttling « Slow 3G »).

1. Saisir « marc@kommit-test.dev » dans le champ « Email ».
2. Saisir « Password1234 » dans le champ « Mot de passe ».
3. Cliquer sur le bouton « Me connecter ».

Attendu : pendant l'appel, le bouton est désactivé (clics sans effet, bouton estompé), le
libellé « Me connecter » a laissé place à un spinner animé, et le texte « Connexion en cours »
n'est lisible nulle part à l'écran tout en étant présent pour les lecteurs d'écran (visible
dans l'inspecteur d'accessibilité). Une fois la réponse reçue, on arrive sur `/`, connecté.

> ℹ️ Le pendant signup suit le même mécanisme, avec le texte « Création du compte en cours » à
> la place. Il n'est pas rejoué ici : le smoke reste une passe rapide.

🤖 Déjà en e2e : `e2e/signin.test.ts`, test « CA17 », mais **uniquement** la partie « bouton
désactivé ». Le reste est écrit juste en dessous, en `test.fixme` nommé « RM17 (SM-7) », qui
cible le spinner et le nom accessible « Connexion en cours » : il reste inerte jusqu'à ce que
KOM-29 soit traité, puis il suffira de retirer le `fixme`. La moitié « annoncé sans être
visible » reste à la main : un texte en `sr-only` garde une boîte de 1px, que Playwright compte
comme visible, donc une assertion d'invisibilité échouerait sur un code pourtant correct.

- [ ] Vérifié

---

### SM-8 (RM16) — Double-clic sur le bouton : une seule requête part

> ✅ **Ce qu'on vérifie :**
> - Un double-clic rapide sur « Me connecter » n'envoie qu'un seul appel de connexion.
> - Pourquoi un smoke : ce qu'on vérifie est que le navigateur n'émet pas un 2e appel entre les
>   2 clics. Le `disabled` de RM17 est le mécanisme, déjà couvert en unitaire ; la garantie, elle,
>   ne s'observe que sur un vrai navigateur face à un vrai réseau.

Précondition : dev server et backend lancés, compte `marc@kommit-test.dev` existant, page
`/signin` ouverte, outils de développement ouverts sur l'onglet Réseau, filtré sur
`sign-in/email`.

1. Saisir « marc@kommit-test.dev » dans le champ « Email ».
2. Saisir « Password1234 » dans le champ « Mot de passe ».
3. Double-cliquer rapidement sur le bouton « Me connecter ».

Attendu : l'onglet Réseau montre **une seule** requête vers `sign-in/email`. Le bouton passe en
désactivé dès le 1er clic, puis on arrive sur `/` connecté, une seule fois, sans message
d'erreur de double soumission.

🤖 Déjà en e2e : `e2e/signin.test.ts`, test « CA16 » (il compte les requêtes interceptées et
attend exactement 1).

- [ ] Vérifié

---

### SM-9 (RM8) — Signup réussi : retour sur l'accueil, connecté

> ✅ **Ce qu'on vérifie :**
> - Un signup valide crée le compte et ramène sur l'accueil, en état connecté.
> - Pourquoi un smoke : le compte doit être réellement créé, la session réellement posée
>   (cookie cross-origin, `credentials: 'include'`) et la navigation réellement effectuée.
>   3 dépendances, dont celle que la contrainte technique du ticket désigne comme le point de
>   rupture : sans `credentials: 'include'`, la requête suivante arrive sans session et RM8 ne
>   peut jamais passer.

Précondition : dev server et backend lancés, aucune session ouverte, page `/signup` ouverte, et
un email **jamais utilisé** sous la main (sinon le backend répond `EMAIL_ALREADY_EXISTS`).

1. Saisir « Marc » dans le champ « Prénom* », l'email neuf dans le champ « Email* », et
   « Password1234 » dans le champ « Mot de passe* ».
2. Cliquer sur le bouton « Créer un compte ».

Attendu : on arrive sur `/`, le titre affiche « Quoi de neuf aujourd'hui, Marc ? » et le header
montre le bouton « Se déconnecter ». Le toast de bienvenue apparaît aussi : il est vérifié
séparément par SM-11.

🤖 Déjà en e2e : `e2e/signup.test.ts`, test « CA8 ».

- [ ] Vérifié

---

### SM-10 (RM12) — Signin réussi : retour sur l'accueil, connecté

> ✅ **Ce qu'on vérifie :**
> - Un signin avec des identifiants corrects ramène sur l'accueil, en état connecté.
> - Pourquoi un smoke : même raison que SM-9, la session doit être réellement posée et lue au
>   chargement suivant.

Précondition : dev server et backend lancés, compte `marc@kommit-test.dev` /
« Password1234 » existant, aucune session ouverte, page `/signin` ouverte.

1. Saisir « marc@kommit-test.dev » dans le champ « Email », et « Password1234 » dans le champ
   « Mot de passe ».
2. Cliquer sur le bouton « Me connecter ».

Attendu : on arrive sur `/`, le titre affiche « Quoi de neuf aujourd'hui, Marc ? » et le header
montre le bouton « Se déconnecter ». Le toast de reconnexion apparaît aussi : il est vérifié
séparément par SM-12.

🤖 Déjà en e2e : `e2e/signin.test.ts`, test « CA12 ».

- [ ] Vérifié

---

## 4. Le toast d'arrivée

| RM | Inventaire | Ce qu'on vérifie | Scénario |
|---|---|---|---|
| RM3, RM4 | 🟠 | Toast « Bienvenue {prénom}, ton compte est créé. » après un signup, « Content de te revoir {prénom} » après un signin | SM-11 (signup), SM-12 (signin) |
| RM24, RM25 | 🟠 | Le toast ne réapparaît pas après un rechargement ou un « retour » navigateur, et une session persistée ouvre l'accueil sans toast | SM-13 (rechargement et retour), SM-14 (session persistée) |

### SM-11 (RM3) — Toast après un signup : « Bienvenue {prénom}, ton compte est créé. »

> ✅ **Ce qu'on vérifie :**
> - En arrivant sur l'accueil depuis un signup, un toast affiche « Bienvenue Marc, ton compte
>   est créé. », avec le point final.
> - C'est bien un **toast** éphémère, pas un écran plein : il est posé dans un coin, se ferme
>   avec sa croix, et disparaît tout seul.
> - Pourquoi un smoke : choisir le message d'après la page de provenance est entièrement notre
>   code, déjà couvert en unitaire, et le contrat d'API confirme que `SessionUser` ne porte
>   aucun champ de provenance. Qu'un toast éphémère apparaisse relève de la librairie de toast
>   et du navigateur.

Précondition : dev server et backend lancés, aucune session ouverte, page `/signup` ouverte, un
email jamais utilisé sous la main.

1. Saisir « Marc » dans le champ « Prénom* », l'email neuf dans le champ « Email* », et
   « Password1234 » dans le champ « Mot de passe* ».
2. Cliquer sur le bouton « Créer un compte ».

Attendu : à l'arrivée sur `/`, un toast de succès affiche « Bienvenue Marc, ton compte est
créé. » dans un coin de l'écran, avec une icône de succès et une croix de fermeture. Il
disparaît de lui-même au bout de quelques secondes, et la page dessous reste l'accueil
connecté.

3. Rejouer les étapes 1 et 2 avec un autre email neuf, puis cliquer sur la croix du toast.

Attendu : le toast se ferme immédiatement, sans rien changer à la page.

> ✅ **Divergence de position résolue.** Ce cadre annonçait un toast sorti **en bas à droite**
> au lieu du haut à droite de la maquette. Le code a été corrigé depuis (commit 8434975) :
> `src/components/ui/toast.tsx` donne maintenant au viewport `top-[100px]` et `sm:right-4`,
> donc en haut à droite, sous la navbar. Plus rien à trancher.
>
> ℹ️ 2 anomalies d'accessibilité sur la croix de fermeture, relevées en la transcrivant.
> D'abord, elle porte le nom accessible « Close toast », en anglais, dans une interface
> entièrement en français. Ensuite, Base UI la laisse `aria-hidden="true"` tant que la pile de
> toasts n'est pas survolée ou focalisée : elle est donc hors de l'arbre d'accessibilité au
> moment où le toast apparaît. Les 2 points sont à voir avec le parent, hors périmètre e2e.

🤖 Déjà en e2e : `e2e/toast.test.ts`, 2 tests « RM3 (SM-11) » -- un pour l'apparition et la
disparition automatique, un pour la fermeture à la croix. Le survol du toast est nécessaire
pour atteindre la croix (voir la note de code), et il met en pause la disparition automatique :
d'où 2 tests plutôt qu'un.

- [ ] Vérifié

---

### SM-12 (RM4) — Toast après un signin : « Content de te revoir {prénom} »

> ✅ **Ce qu'on vérifie :**
> - En arrivant sur l'accueil depuis un signin, un toast affiche « Content de te revoir Marc »,
>   **sans point final** (libellé arbitré le 2026-11-05 en faveur de la maquette).
> - Le message est différent de celui du signup, alors que la réponse du serveur est la même :
>   c'est le front qui transporte la provenance.
> - Pourquoi un smoke : même raison que SM-11.

Précondition : dev server et backend lancés, compte `marc@kommit-test.dev` /
« Password1234 » existant, aucune session ouverte, page `/signin` ouverte.

1. Saisir « marc@kommit-test.dev » dans le champ « Email », et « Password1234 » dans le champ
   « Mot de passe ».
2. Cliquer sur le bouton « Me connecter ».

Attendu : à l'arrivée sur `/`, un toast de succès affiche exactement « Content de te revoir
Marc », sans point final, avec sa croix de fermeture, et disparaît de lui-même au bout de
quelques secondes. Le message « Bienvenue Marc, ton compte est créé. » n'apparaît pas.

> ✅ Même correction de position que SM-11 : le toast sort bien en haut à droite.

🤖 Déjà en e2e : `e2e/toast.test.ts`, test « RM4 (SM-12) ». Le `exact: true` du test rejette
une variante avec point final, et vérifie au passage que le message du signup n'apparaît pas.

- [ ] Vérifié

---

### SM-13 (RM24) — Rechargement et « retour » navigateur : le toast ne réapparaît pas

> ✅ **Ce qu'on vérifie :**
> - Après l'apparition du toast d'arrivée, un rechargement de la page ne le fait pas revenir.
> - Un « retour » puis un « suivant » dans le navigateur ne le font pas revenir non plus.
> - Pourquoi un smoke : effacer l'information de provenance dès qu'elle a servi est une décision
>   à nous, couverte en unitaire. Mais ce qu'on vérifie vraiment est le comportement du
>   rechargement et des boutons d'historique du navigateur, plus une session réellement
>   persistée : notre logique peut être juste et la RM tomber quand même.

Précondition : dev server et backend lancés, venir de jouer SM-12, donc être sur `/` connecté,
toast de reconnexion déjà apparu (attendre qu'il ait disparu avant de commencer).

1. Recharger la page.

Attendu : l'accueil connecté se réaffiche avec « Quoi de neuf aujourd'hui, Marc ? » et aucun
toast n'apparaît.

2. Cliquer sur le bouton « retour » du navigateur.
3. Cliquer sur le bouton « suivant » du navigateur pour revenir sur `/`.

Attendu : on est de nouveau sur l'accueil connecté, et aucun toast n'apparaît, ni « Bienvenue
Marc, ton compte est créé. » ni « Content de te revoir Marc ».

> ⚠️ 3 étapes et 2 points d'observation, parce que RM24 nomme explicitement 2 gestes distincts
> (rechargement, retour navigateur). C'est la limite du smoke, pas un dépassement.

🤖 Déjà en e2e : `e2e/toast.test.ts`, test « RM24 (SM-13) ».

- [ ] Vérifié

---

### SM-14 (RM25) — Session persistée, ouverture directe de l'accueil : aucun toast

> ✅ **Ce qu'on vérifie :**
> - Un utilisateur dont la session est déjà posée, qui ouvre l'accueil directement sans passer
>   par signin ni signup, voit la page personnalisée **sans** toast.
> - Pourquoi un smoke : il faut une session réellement persistée côté cookie, et l'absence de
>   toast s'observe à l'écran.

Précondition : dev server et backend lancés, session ouverte avec le compte `Marc`, puis fermer
l'onglet (sans se déconnecter).

1. Ouvrir un nouvel onglet directement sur `http://localhost:5173/`.

Attendu : l'accueil s'affiche en état connecté, titre « Quoi de neuf aujourd'hui, Marc ? » et
bouton « Se déconnecter » dans le header. Aucun toast n'apparaît, à aucun moment.

🤖 Déjà en e2e : `e2e/toast.test.ts`, test « RM25 (SM-14) ». Le nouvel onglet est un
`context.newPage()` : il partage les cookies, donc la session, mais pas le `sessionStorage`,
qui est propre à chaque onglet. C'est exactement la situation que décrit RM25.

- [ ] Vérifié

---

## 5. Sign out et fin de session

| RM | Inventaire | Ce qu'on vérifie | Scénario |
|---|---|---|---|
| RM5 | 🔴 | Clic sur « Déconnexion » : session fermée, accueil en état non connecté, sans modale ni toast | SM-15 |
| RM31 | 🔴 | Session expirée : au prochain chargement, accueil non connecté, sans aucun message | SM-16 |

### SM-15 (RM5) — Déconnexion silencieuse : retour à l'accueil non connecté

> ✅ **Ce qu'on vérifie :**
> - Le clic sur « Se déconnecter » ferme la session et repasse l'accueil en état non connecté.
> - La déconnexion est **silencieuse** : ni modale de confirmation, ni toast.
> - Pourquoi un smoke : ce qu'on vérifie est que la session est réellement fermée côté serveur
>   et que le cookie ne revient plus. L'absence de modale et de toast s'observe à l'écran.

Précondition : dev server et backend lancés, session ouverte avec le compte `Marc` (par exemple
à l'issue de SM-10), page `/` ouverte, bouton « Se déconnecter » visible.

1. Cliquer sur le bouton « Se déconnecter » dans le header.

Attendu : aucune boîte de dialogue de confirmation n'apparaît, aucun toast n'apparaît, et
l'accueil repasse directement en état visiteur : titre « Prêt(e) pour ton daily standup ? », et
les 2 liens « Se connecter » et « Créer un compte » de retour dans le header.

2. Recharger la page.

Attendu : l'accueil reste en état visiteur, ce qui confirme que la session est bien fermée côté
serveur et pas seulement oubliée côté écran.

> ℹ️ Le ticket écrit « Déconnexion » dans l'énoncé de RM5, le libellé réel du bouton est
> « Se déconnecter » (`src/data/layout.ts`, `NAVBAR.signOut`), conforme à la maquette. C'est
> « Se déconnecter » qu'il faut chercher à l'écran.

🤖 Déjà en e2e : `e2e/signout.test.ts`, test « CA5 », **en entier** depuis le 2026-11-05 : le
rechargement de l'étape 2 y a été ajouté.

- [ ] Vérifié

---

### SM-16 (RM31) — Session expirée : accueil non connecté et silencieux

> ✅ **Ce qu'on vérifie :**
> - Quand la session n'est plus valide, le chargement suivant de l'accueil affiche l'état non
>   connecté.
> - Aucun message n'est affiché : ni toast, ni bandeau, ni « votre session a expiré ».
> - Pourquoi un smoke : l'expiration est produite par Better Auth et le cookie, pas par notre
>   code. Un test unitaire ne pourrait que rejouer notre propre hypothèse sur ce que fait la
>   dépendance.

Précondition : dev server et backend lancés, session ouverte avec le compte `Marc`, page `/`
ouverte en état connecté, outils de développement ouverts sur l'onglet Application, section
Cookies.

1. Supprimer le cookie de session Better Auth (`better-auth.session_token`) sur
   `http://localhost:3000`.
2. Recharger la page `/`.

Attendu : l'accueil s'affiche en état visiteur, titre « Prêt(e) pour ton daily standup ? » et
les 2 liens « Se connecter » et « Créer un compte » dans le header. Aucun toast, aucun bandeau,
aucun message d'expiration n'apparaît.

> ℹ️ Supprimer le cookie **simule** l'expiration : côté front, une session expirée et une
> session absente produisent la même lecture, à savoir `Session` à `null` dans
> `src/types/apiContract.ts`. Vérifier une vraie expiration par le temps demanderait de
> raccourcir la durée de session côté backend, ce qui sort du périmètre de ce repo et de celui
> d'un smoke.

🤖 Déjà en e2e : `e2e/signout.test.ts`, test « RM31 (SM-16) ». Le test vérifie d'abord que le
cookie `better-auth.session_token` est bien posé, puis le supprime via
`context.clearCookies`, et recharge.

- [ ] Vérifié
