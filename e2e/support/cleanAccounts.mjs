// Liste ou supprime les comptes de test créés pendant une session de QA (/run-qa).
// Vise la base du déploiement DEV (branche Neon dev-en-ligne), jamais celle du local.
// Le filtre se limite aux emails de test créés APRÈS l'heure de début du QA, pour ne
// jamais toucher un compte antérieur.
//
// Lancé par les scripts pnpm qa:accounts:list et qa:accounts:delete, qui chargent le
// fichier d'environnement du QA. Un appel direct à node sans ce fichier n'a pas l'URL.

import pg from 'pg'

const EMAILS_DE_TEST = '%@test.dev'

const [mode, depuis] = process.argv.slice(2)

if (mode !== '--list' && mode !== '--delete') {
  console.error("Usage : cleanAccounts.mjs --list|--delete <date ISO de début du QA>")
  process.exit(1)
}

// Format strict : Date.parse accepte "2000", qui viserait toute l'histoire de la base.
const DATE_ISO_COMPLETE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

if (!depuis || !DATE_ISO_COMPLETE.test(depuis) || Number.isNaN(Date.parse(depuis))) {
  console.error(`Date de début refusée : ${JSON.stringify(depuis)}. Attendu une date ISO complète avec fuseau, par exemple 2026-11-18T13:00:00Z (obtenue avec date -u +%Y-%m-%dT%H:%M:%SZ).`)
  process.exit(1)
}

if (!process.env.E2E_DATABASE_URL) {
  console.error("E2E_DATABASE_URL absent : lancer via pnpm qa:accounts:list ou pnpm qa:accounts:delete.")
  process.exit(1)
}

const client = new pg.Client({ connectionString: process.env.E2E_DATABASE_URL })

// user.createdAt est un TIMESTAMP(3) SANS fuseau : Postgres ignorerait l'offset du texte
// reçu. On envoie donc l'instant converti en UTC, et on compare en timestamp nu.
const parametres = [new Date(depuis).toISOString(), EMAILS_DE_TEST]
const FENETRE = '"createdAt" >= $1::timestamp AND "email" LIKE $2'

await client.connect()
try {
  const { rows } = await client.query(
    `SELECT "email", "createdAt" FROM "user" WHERE ${FENETRE} ORDER BY "createdAt"`,
    parametres,
  )

  if (rows.length === 0) {
    console.log(`Aucun compte de test créé depuis ${depuis}.`)
  } else {
    console.table(rows)
  }

  if (mode === '--delete') {
    // session et account référencent user en ON DELETE CASCADE : une seule suppression
    // suffit, et elle est atomique à elle seule.
    const { rowCount } = await client.query(`DELETE FROM "user" WHERE ${FENETRE}`, parametres)
    console.log(`${rowCount} compte(s) de test supprimé(s).`)
  }
} finally {
  await client.end()
}
