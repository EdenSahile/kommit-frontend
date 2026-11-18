#!/bin/bash
# Vérifie le hook guard-e2e-qa.sh : un code de sortie attendu par cas.
# 0 = la modification passe, 2 = elle est bloquée.
#
# Pose et retire le marqueur de session de QA : ne pas lancer pendant un vrai QA.

REPO=$(git rev-parse --show-toplevel) || exit 1
H="$REPO/.claude/hooks/guard-e2e-qa.sh"
MARQUEUR="$(git rev-parse --absolute-git-dir)/qa-session-active"
export CLAUDE_PROJECT_DIR="$REPO"
cd "$REPO" || exit 1

FAILED=0

# run <nom> <code attendu> <json>
run() {
  echo "$3" | "$H" >/dev/null 2>&1
  local got=$?
  if [ "$got" = "$2" ]; then
    echo "PASS  $1 (exit $got)"
  else
    echo "FAIL  $1 : attendu exit $2, obtenu exit $got"
    FAILED=1
  fi
}

edit() { echo '{"tool_name":"Edit","tool_input":{"file_path":"'"$1"'"}}'; }
ecrire() { echo '{"tool_name":"Write","tool_input":{"file_path":"'"$1"'"}}'; }
shell() { echo '{"tool_name":"Bash","tool_input":{"command":"'"$1"'"}}'; }

echo "=== 1. Hors session de QA, le garde-fou est éteint ==="
rm -f "$MARQUEUR"
run hors-qa-edit-existant 0 "$(edit "$REPO/e2e/signin.test.ts")"
run hors-qa-supprime-un-e2e 0 "$(shell 'rm e2e/signin.test.ts')"

echo "=== 2. Un e2e existant ne se modifie pas, quelle que soit la forme du chemin ==="
touch "$MARQUEUR"
run edit-chemin-absolu 2 "$(edit "$REPO/e2e/signin.test.ts")"
run edit-chemin-relatif 2 "$(edit 'e2e/signin.test.ts')"
run edit-double-slash 2 "$(edit 'e2e//signin.test.ts')"
run edit-point-slash 2 "$(edit 'e2e/./signin.test.ts')"
run edit-casse-du-dossier 2 "$(edit 'E2E/signin.test.ts')"
run edit-casse-de-extension 2 "$(edit 'e2e/signin.test.TS')"

echo "=== 3. Ce que le QA doit pouvoir faire reste autorisé ==="
run write-nouvel-e2e 0 "$(ecrire "$REPO/e2e/rm32.test.ts")"
run edit-src 0 "$(edit "$REPO/src/App.tsx")"
run lance-la-suite-e2e 0 "$(shell 'pnpm test:e2e:qa:seq')"
run lit-un-e2e 0 "$(shell 'cat e2e/signin.test.ts')"
run grep-insensible-dans-un-e2e 0 "$(shell 'grep -i account e2e/signin.test.ts')"
run lance-la-suite-avec-redirection 0 "$(shell 'pnpm test:e2e:qa:seq > sortie.txt')"
run lance-un-seul-test-avec-redirection 0 "$(shell 'npx playwright test e2e/signin.test.ts > /tmp/out.log')"
run liste-les-e2e-avec-redirection 0 "$(shell 'git ls-files e2e/ > /tmp/liste.txt')"

echo "=== 4. Les commandes Bash qui écrivent sur un e2e existant sont bloquées ==="
run supprime-chemin-relatif 2 "$(shell 'rm e2e/signin.test.ts')"
run supprime-chemin-absolu 2 "$(shell "rm $REPO/e2e/signin.test.ts")"
run sed-en-place-chemin-absolu 2 "$(shell "sed -i .bak s/foo/bar/ $REPO/e2e/signin.test.ts")"
run cp-ecrase-un-e2e 2 "$(shell "cp /tmp/faux.ts $REPO/e2e/signin.test.ts")"
run python-ecrit-un-e2e 2 "$(shell 'python3 -c open(e2e/signin.test.ts,w).write(vide)')"
run node-ecrit-un-e2e 2 "$(shell 'node -e fs.writeFileSync(e2e/signin.test.ts,vide)')"
run tee-dans-un-e2e 2 "$(shell 'echo vide | tee e2e/signin.test.ts')"
run redirige-vers-un-e2e 2 "$(shell 'echo vide > e2e/signin.test.ts')"
run supprime-tout-le-dossier 2 "$(shell 'rm -rf e2e/')"
run checkout-du-dossier 2 "$(shell 'git checkout -- e2e/')"

echo "=== 5. Les commandes qui écrivent sans nommer leur cible sont bloquées ==="
run git-apply 2 "$(shell 'git apply /tmp/x.diff')"
run patch 2 "$(shell 'patch -p1 -i /tmp/x.diff')"
run git-stash 2 "$(shell 'git stash')"
run dd 2 "$(shell 'dd of=quelquechose if=/dev/null')"
run ed 2 "$(shell 'ed quelquechose')"

echo "=== 6. Le message de blocage cite la règle ==="
MESSAGE=$(edit "$REPO/e2e/signin.test.ts" | "$H" 2>&1 >/dev/null)
if [[ "$MESSAGE" == *RM5* ]]; then
  echo "PASS  message-cite-RM5"
else
  echo "FAIL  message-cite-RM5 : le message ne cite pas RM5 ($MESSAGE)"
  FAILED=1
fi

echo "=== 7. Le hook échoue fermé quand il ne peut pas faire son travail ==="
echo "$(edit 'e2e/signin.test.ts')" | env PATH=/nonexistent "$H" >/dev/null 2>&1
SANS_OUTILS=$?
if [ "$SANS_OUTILS" = 2 ]; then
  echo "PASS  echoue-ferme-sans-outils (exit 2)"
else
  echo "FAIL  echoue-ferme-sans-outils : attendu exit 2, obtenu exit $SANS_OUTILS"
  FAILED=1
fi

echo "=== 8. Marqueur périmé de 2 h, le garde-fou est éteint ==="
touch -t "$(date -v-2H +%Y%m%d%H%M)" "$MARQUEUR"
run marqueur-perime 0 "$(edit "$REPO/e2e/signin.test.ts")"

echo "=== 9. Hook lancé depuis un autre dossier ==="
touch "$MARQUEUR"
JSON_EDIT=$(edit "$REPO/e2e/signin.test.ts")
(cd /tmp && echo "$JSON_EDIT" | "$H" >/dev/null 2>&1)
DEPUIS_TMP=$?
if [ "$DEPUIS_TMP" = 2 ]; then
  echo "PASS  depuis-un-autre-dossier (exit 2)"
else
  echo "FAIL  depuis-un-autre-dossier : attendu exit 2, obtenu exit $DEPUIS_TMP"
  FAILED=1
fi

echo "=== 10. Hors de tout repo git, aucune session de QA n'est possible ==="
(cd /tmp && echo "$JSON_EDIT" | env -u CLAUDE_PROJECT_DIR "$H" >/dev/null 2>&1)
HORS_REPO=$?
if [ "$HORS_REPO" = 0 ]; then
  echo "PASS  hors-repo-git (exit 0)"
else
  echo "FAIL  hors-repo-git : attendu exit 0, obtenu exit $HORS_REPO"
  FAILED=1
fi

rm -f "$MARQUEUR"
echo
[ "$FAILED" = 0 ] && echo "TOUS LES CAS PASSENT" || echo "AU MOINS UN CAS ÉCHOUE"
exit $FAILED
