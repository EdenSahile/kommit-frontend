// Décide si le toast d'arrivée doit s'afficher, et avec quel message (CA3, CA4, CA24, CA25).
// Le flag est à usage unique : il vaut 'signup' ou 'signin' juste après une auth réussie,
// et null dans tous les autres cas (reload, retour navigateur, ouverture directe avec
// session persistée) — sa consommation (écriture/suppression en storage) est câblée
// ailleurs, hors de cette fonction pure.
// Stub : pas de logique métier ici, seulement une valeur neutre.

export type ArrivalFlag = 'signup' | 'signin'

export type ArrivalToast = {
  type: 'success'
  message: string
}

export function arrivalToastFor(): ArrivalToast | null {
  return null
}
