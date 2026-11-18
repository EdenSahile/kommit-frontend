// Liste ou supprime les comptes de test créés pendant une session de QA (/run-qa).
// La base de DEV est partagée avec le local : le filtre se limite aux emails de test
// créés APRÈS l'heure de début du QA, pour ne jamais toucher un compte antérieur.
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

if (!depuis || Number.isNaN(Date.parse(depuis))) {
  console.error(`Date de début illisible : ${JSON.stringify(depuis)}. Attendu une date ISO, par exemple 2026-11-18T13:00:00Z.`)
  process.exit(1)
}

if (!process.env.E2E_DATABASE_URL) {
  console.error("E2E_DATABASE_URL absent : lancer via pnpm qa:accounts:list ou pnpm qa:accounts:delete.")
  process.exit(1)
}

const client = new pg.Client({ connectionString: process.env.E2E_DATABASE_URL })
const parametres = [depuis, EMAILS_DE_TEST]
const comptesVises = 'SELECT "id" FROM "user" WHERE "createdAt" >= $1 AND "email" LIKE $2'

await client.connect()
try {
  const { rows } = await client.query(
    `SELECT "email", "createdAt" FROM "user" WHERE "createdAt" >= $1 AND "email" LIKE $2 ORDER BY "createdAt"`,
    parametres,
  )

  if (rows.length === 0) {
    console.log(`Aucun compte de test créé depuis ${depuis}.`)
  } else {
    console.table(rows)
  }

  if (mode === '--delete') {
    // session et account pointent vers user : ils partent avant.
    await client.query(`DELETE FROM "session" WHERE "userId" IN (${comptesVises})`, parametres)
    await client.query(`DELETE FROM "account" WHERE "userId" IN (${comptesVises})`, parametres)
    const { rowCount } = await client.query(`DELETE FROM "user" WHERE "id" IN (${comptesVises})`, parametres)
    console.log(`${rowCount} compte(s) de test supprimé(s).`)
  }
} finally {
  await client.end()
}
