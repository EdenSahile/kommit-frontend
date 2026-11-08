# Inventaire des tests, KOM-07 « Authentification · frontend »

Ticket : [Authentification · frontend](https://app.notion.com/p/87be39355d30820b8caf0158b9940f94), `Ticket ID` = KOM-07.
Doctrine appliquée : `docs/testing-strategy.md` (le fichier `docs/workflow-frontend.md` n'existe pas dans ce repo).
Contrat d'API lu : `src/types/apiContract.ts`.

Deux remarques de forme, pour que le tableau se lise sans ambiguïté :

- Le ticket nomme ses critères d'acceptance **RM** (règles métier), pas CA. Les identifiants de la 1re colonne sont donc ceux du ticket, repris tels quels, dans son ordre.
- Les 5 paquets ci-dessous sont **les paquets du ticket** (« Page d'accueil », « Navigation entre les pages », « Formulaire d'authentification », « Le toast d'arrivée », « Sign out et fin de session »). Aucun regroupement n'a été inventé.

Les contraintes techniques du ticket ont été prises en compte. Celle qui pèse le plus sur le tri : la session Better Auth passe par un cookie cross-origin, qui n'arrive que si le front envoie ses requêtes avec `credentials: 'include'`. Tout ce qui dépend d'une session réellement posée (RM8, RM12, RM24, RM25, RM31) peut donc échouer alors que notre logique est correcte, ce qui est exactement la règle de coupe de la doctrine. La contrainte ESLint sur les alias `@/` ne porte sur aucune RM : elle ne produit pas de ligne ici.

### 1. Page d'accueil

| RM | Ce qu'on vérifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| RM1 | Visiteur non connecté sur l'accueil : le message d'accueil s'affiche et le header montre « Se connecter » / « Créer un compte » | 🔴 | Rendu réel d'un contenu largement statique, après lecture d'une session réellement absente. Un test unitaire ne vérifierait que notre propre constante | Manuel (smoke navigateur) |
| RM2 | Utilisateur connecté sur l'accueil : le corps affiche « Quoi de neuf aujourd'hui, {prénom} ? » | 🟠 | Deux tranches. Composer le titre à partir du `name` de la session est une fonction pure (🟢). Que ce titre s'affiche réellement, avec une vraie session, est du rendu navigateur (🔴). ⚠️ Libellé divergent, voir la note sous le tableau | Unitaire (composition du titre) + smoke manuel |
| RM15 | Clic sur « ViDev » dans le footer : la chaîne YouTube s'ouvre dans un nouvel onglet | 🔴 | L'ouverture d'un nouvel onglet est un comportement du navigateur. Vérifier en unitaire qu'un attribut vaut `_blank` ne prouve pas que l'onglet s'ouvre | Manuel (smoke navigateur) |

✅ **Libellé de RM2, arbitré le 2026-11-05 en faveur de la maquette.** Le ticket écrivait « Qu'as-tu fait de beau aujourd'hui, {prénom} ? ». La maquette et le code écrivent « Quoi de neuf aujourd'hui, {prénom} ? » : c'est ce libellé qui est retenu, et le ticket Notion a été corrigé. Ticket, maquette, code et e2e disent désormais la même chose.

### 2. Navigation entre les pages

| RM | Ce qu'on vérifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| RM6 | Clic sur « Créer un compte » : on arrive sur la page de signup | 🔴 | C'est React Router qui navigue. Ce qu'on vérifie est le branchement d'une librairie, pas une décision à nous | Manuel (smoke navigateur) |
| RM7 | Clic sur « Se connecter » : on arrive sur la page de signin | 🔴 | Même raison que RM6 | Manuel (smoke navigateur) |

### 3. Formulaire d'authentification

| RM | Ce qu'on vérifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| RM32 | Signin : « Me connecter » est grisé tant que les champs sont vides, aucune requête ne part | 🟢 | Décision d'état pure : à partir des valeurs des champs, le bouton est-il activé. Calculable en entrées/sorties, sans rendu | Unitaire, test-first |
| RM33 | Signup : « Créer un compte » est grisé tant qu'un champ requis est vide, un prénom composé uniquement d'espaces compte comme vide | 🟢 | Même décision d'état, plus un trim sur le prénom. Normalisation et décision, les deux sont notre code | Unitaire, test-first |
| RM10, RM11, RM20 | Signup : prénom trimé non vide, email bien formé, mot de passe d'au moins 8 caractères. Signin : aucun format vérifié | 🟢 | Validation client au sens strict, l'exemple canonique de la doctrine. L'absence de validation de format au signin est elle aussi une décision vérifiable sur une fonction pure | Unitaire, test-first |
| RM30 | Signup : les erreurs de format apparaissent à la 1re soumission, puis se mettent à jour pendant la saisie | 🟠 | La tranche à nous est le moment : « faut-il afficher les erreurs maintenant ? » se calcule à partir de « a-t-on déjà soumis » et des valeurs saisies. Que le message apparaisse puis se corrige à l'écran dans cet ordre est du rendu réel | Unitaire (décision d'affichage) + smoke manuel |
| RM17 | Appel en cours : le bouton est désactivé, le libellé est remplacé par un spinner, les textes « Connexion en cours » / « Création du compte en cours » sont présents en aria mais invisibles | 🟠 | « Appel en cours → bouton désactivé » est une décision d'état à nous (🟢). Le spinner, et surtout le fait qu'un texte soit annoncé aux lecteurs d'écran sans être visible, dépendent du rendu réel et du CSS calculé (🔴) | Unitaire (état du bouton) + smoke manuel (spinner visible, libellé aria non visible) |
| RM16 | Double-clic sur le bouton : une seule requête part | 🔴 | Ce qu'on vérifie est que le navigateur n'émet pas un 2e appel entre les 2 clics. Le `disabled` de RM17, déjà couvert en unitaire, est le mécanisme ; la garantie, elle, ne s'observe que sur un vrai navigateur face à un vrai réseau | Manuel (smoke navigateur) |
| RM9, RM13 | Erreur métier du serveur : le message affiché est choisi d'après le `code` de l'`ApiError`, email déjà pris ou identifiants invalides (message générique qui ne dit pas quel champ est faux) | 🟢 | Mapping d'un code d'erreur vers un message, le cas que la doctrine donne en exemple de 🟢 pur. Les 2 codes sont bien dans `src/types/apiContract.ts` (`EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`) : les chaînes ne sont pas devinées, donc pas de 🟠 | Unitaire, test-first |
| RM8, RM12 | Signup ou signin réussi : l'utilisateur est ramené sur l'accueil, connecté | 🔴 | Le compte doit être réellement créé, la session réellement posée (cookie cross-origin, `credentials: 'include'`) et la navigation réellement effectuée. Trois dépendances, dont celle que la contrainte technique du ticket désigne comme le point de rupture | Manuel (smoke navigateur) |

### 4. Le toast d'arrivée

| RM | Ce qu'on vérifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| RM3, RM4 | Le toast affiche « Bienvenue {prénom}, ton compte est créé. » après un signup, « Content de te revoir {prénom} » après un signin | 🟠 | Choisir le message d'après la page de provenance est entièrement notre code : le contrat d'API confirme que `SessionUser` ne porte aucun champ qui dise d'où vient l'utilisateur, donc rien n'est mocké que le back pourrait démentir (🟢). Qu'un toast éphémère apparaisse en haut à droite relève de sonner et du navigateur (🔴) | Unitaire (choix du message) + smoke manuel (le toast apparaît bien, et c'est un toast) |
| RM24, RM25 | Le toast ne réapparaît pas après un rechargement ou un « retour » navigateur, et un utilisateur dont la session est persistée ouvre l'accueil sans toast | 🟠 | Effacer l'information de provenance dès qu'elle a servi est une décision à nous, testable en unitaire. Mais ce qu'on vérifie vraiment est le comportement du rechargement et du bouton « retour », plus une session réellement persistée : notre logique peut être juste et la RM tomber quand même | Unitaire (l'information est consommée une seule fois) + smoke manuel (rechargement, retour navigateur, ouverture directe avec session) |

### 5. Sign out et fin de session

| RM | Ce qu'on vérifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| RM5 | Clic sur « Déconnexion » : la session est fermée, l'accueil repasse en état non connecté, sans modale ni toast | 🔴 | Ce qu'on vérifie est que la session est réellement fermée côté serveur et que le cookie ne revient plus. L'absence de modale et de toast s'observe à l'écran | Manuel (smoke navigateur) |
| RM31 | Session expirée : au prochain chargement, l'accueil s'affiche en non connecté, sans aucun message | 🔴 | L'expiration est produite par Better Auth et le cookie, pas par notre code. Un test unitaire ne pourrait que rejouer notre propre hypothèse sur ce que fait la dépendance | Manuel (smoke navigateur) |

---

## Récap

### Test unitaire automatisé (→ `unit-test-writer`)

- **RM32** : signin, bouton grisé tant que les champs sont vides.
- **RM33** : signup, bouton grisé tant qu'un champ requis est vide, prénom d'espaces compté comme vide.
- **RM10, RM11, RM20** : validation de format au signup (prénom trimé, email, mot de passe ≥ 8), et absence de validation de format au signin.
- **RM9, RM13** : mapping `EMAIL_ALREADY_EXISTS` et `INVALID_CREDENTIALS` vers leurs messages, le message de signin restant générique.

### Couverture partielle, unitaire **et** smoke manuel (🟠)

- **RM2** : unitaire sur la composition du titre à partir du prénom. Smoke à faire : ouvrir l'accueil avec une session réelle et lire le titre personnalisé (libellé à arbitrer, voir la note du paquet 1).
- **RM30** : unitaire sur la décision « afficher les erreurs maintenant ou pas ». Smoke à faire : soumettre un signup invalide, constater que les messages n'apparaissent qu'à ce moment-là, puis corriger un champ et voir le message disparaître pendant la saisie.
- **RM17** : unitaire sur « appel en cours → bouton désactivé ». Smoke à faire : lancer un signin, constater le spinner à la place du libellé et vérifier que « Connexion en cours » n'est pas visible à l'écran tout en étant annoncé.
- **RM3, RM4** : unitaire sur le choix du message selon la provenance. Smoke à faire : arriver sur l'accueil depuis un signup, puis depuis un signin, et vérifier les 2 messages dans un toast éphémère en haut à droite, avec sa croix de fermeture.
- **RM24, RM25** : unitaire sur la consommation unique de l'information de provenance. Smoke à faire : après l'apparition du toast, recharger la page, faire « retour » navigateur, puis ouvrir directement l'accueil avec une session persistée, et vérifier qu'aucun toast ne réapparaît dans les 3 cas.

### Vérification à la main (→ `smoke-test-writer`)

- **RM1** : accueil visiteur non connecté, message et boutons du header.
- **RM15** : « ViDev » dans le footer ouvre la chaîne YouTube dans un nouvel onglet.
- **RM6** : « Créer un compte » mène à la page de signup.
- **RM7** : « Se connecter » mène à la page de signin.
- **RM16** : double-clic sur le bouton de soumission, une seule requête.
- **RM8, RM12** : signup réussi et signin réussi, retour sur l'accueil connecté.
- **RM5** : déconnexion, retour en état non connecté, sans modale ni toast.
- **RM31** : session expirée, accueil non connecté et silencieux.
