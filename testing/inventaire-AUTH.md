# Inventaire des tests -- KOM-07 (Authentification frontend)

> **Doctrine absente.** Le fichier `docs/workflow-frontend.md` n'existe pas dans le repo.
> Les regles de tri appliquees ici viennent des instructions de l'agent test-planner
> (frontiere frontend : notre code vs comportement d'une dependance). Si l'equipe veut
> une source de verite partagee, ce fichier est a creer.

> **Contrat d'API** : `src/types/apiContract.ts` present. Codes d'erreur auth utilises :
> `EMAIL_ALREADY_EXISTS`, `INVALID_CREDENTIALS`. Types : `SessionUser`, `Session`, `ApiError`.

---

### Page d'accueil

| CA | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| CA1 | L'accueil affiche un message d'accueil et les boutons Se connecter / Creer un compte quand le visiteur n'est pas connecte | :red_circle: | Rendu HTML et presence de boutons dans le header -- comportement du navigateur et de React | Manuel (smoke navigateur) |
| CA2 | L'accueil affiche "Qu'as-tu fait de beau aujourd'hui, {prenom} ?" quand l'utilisateur est connecte | :red_circle: | Texte personnalise avec le prenom de la session -- rendu navigateur + reponse de l'API session | Manuel (smoke navigateur) |
| CA15 | Le clic sur "ViDev" dans le footer ouvre la chaine YouTube dans un nouvel onglet | :red_circle: | Ouverture d'un lien en nouvel onglet (`target="_blank"`) -- comportement du navigateur | Manuel (smoke navigateur) |

### Navigation entre les pages

| CA | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| CA6 | Le clic sur "Creer un compte" amene sur la page signup | :red_circle: | Navigation entre routes -- comportement de React Router | Manuel (smoke navigateur) |
| CA7 | Le clic sur "Se connecter" amene sur la page signin | :red_circle: | Navigation entre routes -- comportement de React Router | Manuel (smoke navigateur) |

### Formulaire d'authentification

| CA | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| -- (signin) | Le bouton "Me connecter" est grise tant que les champs email et mot de passe sont vides | :green_circle: | Decision d'etat : "le bouton est-il actif ?" selon les valeurs saisies. Fonction pure dans `logic/` | Unitaire, test-first |
| -- (signup) | Le bouton "Creer un compte" est grise tant qu'un champ requis est vide (prenom, email, mot de passe) | :green_circle: | Meme decision d'etat pour le signup, avec trois champs requis. Fonction pure dans `logic/` | Unitaire, test-first |
| CA10, CA11, CA20 | Validation a la soumission : prenom trime non vide, email bien forme, mot de passe >= 8 caracteres | :green_circle: | Validation client -- regles pures, testables sans rendu. Fonctions dans `logic/` | Unitaire, test-first |
| CA30 | La verification des champs se fait au moment de la soumission du formulaire, pas a la saisie | :red_circle: | Le moment ou la validation se declenche (submit, pas onChange) depend du cablage react-hook-form et du rendu du formulaire, pas d'une fonction pure | Manuel (smoke navigateur) |
| CA8, CA12 | Apres un signup ou signin reussi, l'utilisateur est ramene sur l'accueil connecte | :red_circle: | Redirection apres reponse API reussie -- comportement de React Router + API backend | Manuel (smoke navigateur) |
| CA17 | Pendant un appel API, le bouton est desactive, un spinner remplace le libelle, et un texte aria est ajoute ("Connexion en cours" / "Creation du compte en cours") | :red_circle: | Rendu d'un etat de chargement (spinner, attribut aria, disabled) -- comportement du navigateur et du composant | Manuel (smoke navigateur) |
| CA16 | Un double-clic sur le bouton n'envoie qu'une seule requete (garanti par le bouton desactive de CA17) | :red_circle: | Meme mecanisme que CA17 : le bouton disabled empeche le second clic. Comportement du navigateur | Manuel (smoke navigateur) |
| CA9, CA13 | Le message d'erreur affiche depend du code de l'ApiError : `EMAIL_ALREADY_EXISTS` -> email deja pris ; `INVALID_CREDENTIALS` -> message generique sans dire quel champ est faux | :orange_circle: | Mapping code d'erreur API vers message affiche -- notre code, fonction pure dans `logic/`. Les codes existent dans le contrat (`src/types/apiContract.ts`), mais un smoke doit confirmer que l'API les renvoie effectivement et que le message s'affiche a l'ecran | Unitaire (mapping) + smoke manuel |

### Le toast d'arrivee

| CA | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| CA3, CA4 | Apres signup : toast "Bienvenue {prenom}, ton compte est cree." ; apres signin : toast "Content de te revoir {prenom}." | :green_circle: | Decision entierement frontend : le flag de navigation a usage unique determine le type de toast, le prenom vient de la session. Fonction pure dans `logic/` (contrainte technique du ticket : le serveur ne dit pas d'ou l'on vient) | Unitaire, test-first |
| CA24 | Au reload ou retour navigateur, le toast ne reapparait pas | :green_circle: | Meme decision : le flag a usage unique est consomme apres lecture. "Pas de flag -> pas de toast" est testable comme fonction pure | Unitaire, test-first |
| CA25 | Ouverture directe de l'accueil avec session persistee : page personnalisee sans toast | :green_circle: | Pas de flag de navigation = pas de toast. Meme decision que CA24. La partie "page personnalisee s'affiche" releve de CA2 (verification manuelle) | Unitaire, test-first |

### Sign out

| CA | Ce qu'on verifie | Testable unitaire ? | Pourquoi | Comment |
|---|---|---|---|---|
| CA5 | Le clic "Deconnexion" ferme la session et repasse en accueil non connecte, sans modale ni toast | :red_circle: | Fermeture de session = appel API backend ; retour a l'etat non connecte = rendu navigateur + React Router | Manuel (smoke navigateur) |

---

## Recap

### Unitaire automatise (-> unit-test-writer)

- -- (signin) : bouton signin grise si champs vides
- -- (signup) : bouton signup grise si champ requis vide
- CA10, CA11, CA20 : validation client (prenom trime non vide, email bien forme, mot de passe >= 8 caracteres)
- CA3, CA4 : message du toast d'arrivee selon le type de flow (signup vs signin)
- CA24 : pas de toast au reload (flag consomme)
- CA25 : pas de toast a l'ouverture directe (pas de flag)

### Couverture partielle -- unitaire + smoke manuel

- CA9, CA13 : mapping code d'erreur API -> message affiche. Le smoke doit confirmer que l'API renvoie `EMAIL_ALREADY_EXISTS` (signup, email pris) et `INVALID_CREDENTIALS` (signin, identifiants faux) tels que documentes dans le contrat, et que le message s'affiche a l'ecran.

### Verification manuelle (-> smoke-test-writer)

- CA1 : accueil visiteur non connecte (message + boutons header)
- CA2 : accueil utilisateur connecte (texte personnalise avec prenom)
- CA15 : lien ViDev en nouvel onglet
- CA6 : navigation vers signup
- CA7 : navigation vers signin
- CA30 : validation au submit (pas a la saisie)
- CA8, CA12 : redirection apres auth reussie
- CA17 : etat de chargement du bouton (spinner + aria + disabled)
- CA16 : double-clic, une seule requete
- CA5 : deconnexion silencieuse (ni modale, ni toast)
