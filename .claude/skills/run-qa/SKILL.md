---
name: run-qa
description: Teste seul une US entière sur le lien de déploiement du frontend en DEV, en 2 passes (les tests e2e scriptés puis l'exploration d'un navigateur), et rend un rapport QA avec une capture par test et les KO classés par gravité. Ne modifie jamais le code de prod ni un test e2e existant. Utiliser quand l'utilisateur dit "run-qa", "lance le QA", "teste l'US sur le lien déployé".
---

## Entrée

- L'**US à tester**, choisie par l'utilisateur parmi les groupes que le skill lui propose. Le skill ne la devine jamais (RM2).

## Sortie

- Le **chemin du rapport QA**, sous `testing/qa-reports/qa-<US>-<AAAA-MM-JJ>.md`.
- Un **bilan affiché dans la conversation** portant le nombre d'OK et de KO par passe, la durée totale, et la liste des KO bloquants.

---

## Prérequis

Le QA a besoin du fichier d'environnement `.env.qa`, qui porte `QA_BASE_URL` (le lien de
déploiement du frontend en DEV) et `E2E_DATABASE_URL` (la base Neon de DEV).

Vérifier qu'il existe avec `ls -a | grep -i env`, et lire la liste renvoyée. **Ne pas
écrire son nom dans une commande** : un hook global refuse toute commande Bash contenant la
chaîne `.env`, donc un `test -f` ou un `grep` qui le nomme serait bloqué. La même règle
interdit d'en lire le contenu, et le skill n'en a pas besoin.

Si le fichier n'apparaît pas dans la liste, **s'arrêter là** et demander à l'utilisateur de
le créer en partant de `.env.qa.example`. Ne jamais retomber sur `localhost` quand il
manque : le QA ne teste que des liens déployés (RM2).

## Étapes

Lancer `date +%s` au début et garder la valeur : c'est le point de départ du chrono.
Relancer `date` à la fin de chaque étape pour suivre le budget de 20 minutes (RM4).

### 1. Choisir l'US (RM1, RM2)

Lire les tickets dont `Agile Statut = "TO TEST"` dans la data source
`collection://67ee3935-5d30-83a9-be44-07328ea60fc7`, puis les grouper par leur champ `US`
(valeurs possibles `US0`, `F1-US1`, `F2-US1`).

Afficher chaque groupe avec les `Ticket ID` et les titres qu'il contient, puis **demander à
l'utilisateur quelle US tester**. Une seule US par session de QA.

### 2. Lire les règles métier

Lire les tickets de **tâche** du groupe choisi, pas le ticket d'US. Ce sont les tickets de
tâche qui décrivent ce que l'app fait vraiment : les règles sont corrigées en cours de route
dans ces tickets, et le ticket d'US n'est pas remis à jour.

Relever toutes les règles métier (RM) et, pour chacune, se demander : **un utilisateur
peut-il la déclencher depuis l'app ?** Celles qui demandent une panne serveur simulée ou un
appel direct à l'API sont hors périmètre (voir l'étape 6).

### 3. Activer le garde-fou

```bash
touch "$(git rev-parse --absolute-git-dir)/qa-session-active"
```

À lancer **avant** la passe 1. Ce marqueur active le hook `.claude/hooks/guard-e2e-qa.sh`,
qui refuse toute modification d'un test e2e tracké par git, y compris venant des agents que
ce skill lance (RM5). Les nouveaux fichiers e2e, non trackés, restent libres (RM8).

Le marqueur vit dans le dossier `.git` : propre à ce clone, hors du suivi git, et visible
par une 2ᵉ session Claude ouverte sur le même repo.

### 4. Passe 1, les tests déjà écrits (RM7)

Lancer `pnpm test:e2e:qa:seq`. Ce script charge `.env.qa`, donc la suite tape le lien
déployé et non `localhost`.

Relever chaque test OK et KO depuis la sortie.

### 4 bis. Un test rouge ne se classe pas « faux négatif » sans preuve

Un test e2e rouge alors que l'app marche est un **faux négatif** : il va dans le rapport
sous « Faux négatifs à corriger par l'utilisateur », et **interdiction de le corriger**
(RM5).

Mais ce classement ne se décide pas sur une intuition, parce qu'il a une conséquence : un
faux négatif ne compte pas comme un KO, donc il n'arrête pas le workflow (RM9). S'en servir
librement permettrait de requalifier toute une passe 1 rouge et de continuer comme si de
rien n'était. La règle :

- **Un test rouge compte comme un KO par défaut.** C'est le cas qui ne demande aucune preuve.
- **Il ne devient un faux négatif qu'à 2 conditions réunies** : la cause de l'échec est
  identifiée et extérieure à l'app (un refus du serveur sur la cadence des appels, une
  coupure réseau, une donnée laissée par un run précédent), **et** la règle métier que le
  test couvrait a été revérifiée à la main dans le navigateur, avec une capture. Sans cette
  revérification, la règle n'a pas été testée du tout : le test rouge reste un KO.
- **Au-delà de 3 tests rouges**, ne pas les revérifier un par un : le budget de 20 minutes
  n'y suffit pas, et un échec massif venant d'une cause commune veut dire que
  l'environnement ne permet pas de faire un QA en l'état. S'arrêter après la passe 1,
  l'écrire en tête du rapport (« environnement inapte au QA »), nommer la cause commune, et
  ne pas faire la passe 2.

### 5. Passe 1, les tests manquants (RM8)

Croiser les RM relevées à l'étape 2 avec les tests e2e existants (`git ls-files e2e/`). Pour
chaque RM non couverte **et déclenchable depuis l'app**, écrire un **nouveau** fichier sous
`e2e/`, jamais une ligne dans un fichier existant.

Reprendre les helpers de **`e2e/helpers.ts`**, que les specs existantes importent toutes en
relatif (`from './helpers'`) : `uniqueEmail(prefixe)`, `fieldByLabel(page, libelle)`,
`createAccountViaApi`, `signUpViaUi`, `signInViaUi`. Ne pas partir sur `e2e/support/`, qui
sert à autre chose : l'accès direct à la base, pour les états qu'on ne peut pas provoquer
depuis l'app. Et suivre la rule `tests-arrange-act-assert.md` : les phases séparées par une
ligne vide, les variables nommées par leur contenu.

L'import relatif est voulu ici : `e2e/` est hors de `src/`, donc hors de portée de l'alias
`@/` (rule `imports.md`).

Puis relancer `pnpm test:e2e:qa:seq`.

### 5 bis. Une RM n'est couverte que si le test l'atteint vraiment

Un test ne compte pour une RM que si **ses assertions portent sur cette RM**. Écrire un
test, le nommer d'après une RM et le compter comme couvert alors qu'il vérifie autre chose
fait croire au rapport qu'une règle est testée quand elle ne l'est pas. C'est le pire
résultat possible pour un QA : un trou présenté comme une couverture.

Le piège le plus fréquent : **une RM que l'interface rend inatteignable, parce qu'une autre
RM bloque en amont.** Exemple vécu sur l'US1. RM20 dit que le serveur refuse un prénom qui
ne contient que des espaces. Mais RM33 grise le bouton de création dans ce cas précis, donc
la requête ne part jamais et le refus du serveur ne peut pas se déclencher depuis l'app.

Dans ce cas, la RM ne se classe pas « couverte », elle va dans « Hors périmètre UI » à
l'étape 6, avec sa raison : « inatteignable depuis l'interface, RM33 grise le bouton
avant ». Le test déjà écrit, lui, se renomme d'après ce qu'il vérifie réellement.

### 6. Noter ce qui est hors périmètre

Une RM qu'un utilisateur ne peut pas déclencher depuis l'app ne se teste pas ici. La lister
dans le rapport sous « Hors périmètre UI » avec sa raison, par exemple une erreur interne
qui demande de faire tomber le serveur, ou une route protégée qui ne se vérifie que par un
appel direct à l'API.

### 7. Rassembler les captures de la passe 1

`screenshot: 'on'` est déjà actif dès que `QA_BASE_URL` est défini
(`playwright.config.ts:18`), donc chaque test produit un PNG sous `test-results/`. Les
copier dans `testing/qa-reports/captures/` sous le nom `passe1-<nom-du-test>.png`.

### 8. Décider de la suite (RM9)

- **Au moins 1 KO** : finir les tests e2e restants, puis **s'arrêter sans faire la passe 2**.
- **0 KO** : la passe 1 est réussie, passer à la passe 2.

Dans les 2 cas, les résultats de la passe 1 vont dans le rapport.

Un faux négatif établi selon l'étape 4 bis n'est pas un KO et n'arrête donc pas le
workflow. Un test rouge qui n'a pas passé ces conditions en est un.

### 9. Passe 2, l'exploration (RM10, RM11)

Lancer l'agent `qa-explorer` en lui donnant :

- le lien déployé (`QA_BASE_URL`) ;
- les RM de l'US, pour qu'il ne rejoue pas ce que la passe 1 a déjà vérifié ;
- les **zones de l'app**, déduites des routes déclarées dans `src/App.tsx` ;
- les **minutes restantes** sur le budget de 20 minutes.

Un KO n'arrête pas la passe 2 : elle va jusqu'au bout de ses cas (RM11).

### 10. Écrire le rapport (RM3)

Écrire `testing/qa-reports/qa-<US>-<AAAA-MM-JJ>.md` selon le gabarit ci-dessous. Les 3
tableaux de gravité y figurent **même vides**.

**Le verdict se calcule, il ne s'apprécie pas.** Il ne dépend que du tableau des ⛔, et
d'aucun autre. Les 4 formulations possibles, à reprendre telles quelles :

| Situation | Verdict à écrire |
|---|---|
| 0 ⛔, les 2 passes sont allées au bout | `déployable` |
| Au moins 1 ⛔ | `non déployable, bloqué par N KO bloquants` |
| Le workflow s'est arrêté avant la fin (KO en passe 1, environnement inapte, budget atteint) | `incomplet, <ce qui n'a pas été testé>` |
| 0 ⛔ mais des ⚠️ ou des 💡 | `déployable, avec N points à reprendre` |

Un ⚠️ ou un 💡 ne rend jamais « non déployable » : c'est le sens même du classement par
gravité. Écrire « non déployable » en ajoutant « aucun KO bloquant » est une contradiction.

### 11. Désactiver le garde-fou

```bash
rm -f "$(git rev-parse --absolute-git-dir)/qa-session-active"
```

À lancer y compris quand le workflow s'arrête en cours de route (KO en passe 1, budget
dépassé, erreur). Un marqueur oublié bloquerait les modifications d'e2e dans les sessions
suivantes. Le hook l'ignore de lui-même au bout de 60 minutes, mais ce n'est qu'un filet de
sécurité, pas le nettoyage.

### 12. Proposer la suppression des comptes de test (RM3)

Les tests e2e créent des comptes avec des emails en `*@test.dev` (`uniqueEmail()` dans
`e2e/support/accounts.ts`). La base de DEV étant partagée avec le local, ils se suppriment à
la fin.

**D'abord montrer, ensuite supprimer.** Les 2 commandes prennent l'heure de début du QA et
ne voient que les comptes créés après, pour ne jamais toucher un compte antérieur. La date
s'obtient en UTC, au format complet, **au tout début du QA** :

```bash
date -u +%Y-%m-%dT%H:%M:%SZ          # à garder dès l'étape 1, c'est <DEBUT_ISO>
pnpm qa:accounts:list <DEBUT_ISO>     # montre les comptes visés
pnpm qa:accounts:delete <DEBUT_ISO>   # supprime, après confirmation SEULEMENT
```

Toute autre forme de date est refusée par le script : une date partielle comme `2000`
viserait toute l'histoire de la base, y compris les comptes de test d'un développeur en
local.

Lancer la liste, afficher le tableau obtenu, **demander confirmation à l'utilisateur**, et
seulement en cas de oui lancer la suppression. Un « non » laisse les comptes en place et le
QA se termine quand même.

Ces 2 commandes passent par des scripts pnpm parce qu'une commande Bash qui nommerait le
fichier d'environnement serait bloquée par le hook global. Le détail est dans
`e2e/support/cleanAccounts.mjs`.

### 13. Afficher le bilan

Afficher dans la conversation le contrat de Sortie : le chemin du rapport, le nombre d'OK et
de KO par passe, la durée totale, et la liste des KO bloquants.

## Le budget de 20 minutes (RM4)

Comparer `date +%s` au point de départ à chaque fin d'étape. Quand les 20 minutes sont
atteintes, **s'arrêter là où on en est**, écrire le rapport avec ce qui a déjà été testé, et
le signaler en tête du bilan ainsi que dans le rapport : « rapport partiel, budget de 20
minutes atteint ». Ce qui n'a pas été testé est listé nommément.

## Gabarit du rapport

```markdown
# Rapport QA, <US> <Nom de la feature>, <AAAA-MM-JJ>

## Bilan

- Passe 1 (tests scriptés) : X OK, Y KO
- Passe 2 (exploration) : X OK, Y KO
- Début : HH:MM, fin : HH:MM, durée : Xm Ys
- Verdict : <une des 4 formulations du tableau de l'étape 10>

La gravité de chaque KO est proposée par le workflow. Relire et corriger si besoin.

## KO par gravité

### ⛔ Bloquants pour le déploiement

| Test | Ce qui se passe | Capture |
|------|-----------------|---------|

### ⚠️ Non bloquants pour le déploiement

| Test | Ce qui se passe | Capture |
|------|-----------------|---------|

### 💡 Améliorations optionnelles

| Test | Ce qui se passe | Capture |
|------|-----------------|---------|

## Passe 1, détail

| Test | RM couverte | Verdict | Capture |
|------|-------------|---------|---------|

## Passe 2, détail

| Zone | Cas exploré | Résultat observé | Verdict | Capture |
|------|-------------|------------------|---------|---------|

## Hors périmètre UI

| RM | Pourquoi elle ne se teste pas depuis l'app |
|----|--------------------------------------------|

## Faux négatifs à corriger par l'utilisateur

| Test e2e | Pourquoi c'est le test qui a tort |
|----------|-----------------------------------|
```

## Garde-fous

- **Garde-fou 1 (RM5), ne jamais modifier un test e2e existant.** Seule la création de
  nouveaux fichiers e2e est permise. Un hook le bloque pendant toute la session. Si un
  blocage survient, ne pas chercher à le contourner : un test rouge se corrige dans l'app,
  pas dans le test, et un faux négatif se note dans le rapport pour que l'utilisateur
  tranche.
- **Garde-fou 2 (RM6), ne jamais modifier le code de prod.** Aucun fichier de `src/`, aucune
  configuration. Celui-là n'est pas bloqué par un hook, parce qu'un hook empêcherait aussi
  l'utilisateur de travailler pendant le QA : c'est donc une consigne, portée ici et dans
  l'agent `qa-explorer`. Ce skill constate et rapporte, il ne corrige rien. Un bug trouvé va
  dans le rapport, jamais dans le code, même quand la correction tient en une ligne.
- **Les seuls fichiers que ce skill écrit** sont le rapport et ses captures sous
  `testing/qa-reports/`, et les nouveaux tests e2e de l'étape 5.
- **Ne jamais tester sur `localhost`** (RM2).

## Couverture des règles métier de KOM-15

| RM | Portée par |
|----|------------|
| RM1 | Le skill lui-même, invoqué par `/run-qa` |
| RM2 | Prérequis (`.env.qa`, jamais `localhost`) et étape 1 (groupement par US) |
| RM3 | Étapes 10 et 12, et le gabarit du rapport |
| RM4 | Section « Le budget de 20 minutes », et la limite de 15 cas passée à `qa-explorer` |
| RM5 | Garde-fou 1, le hook `guard-e2e-qa.sh`, et l'étape 4 bis pour les faux négatifs |
| RM6 | Garde-fou 2, repris dans `qa-explorer` |
| RM7 | Étape 4 |
| RM8 | Étape 5 |
| RM9 | Étapes 8 et 4 bis (un test rouge non revérifié compte comme un KO) |
| RM10 | Étape 9 |
| RM11 | Étape 9 |
| RM12 | Le premier lancement, sur l'US1 Authentification |
