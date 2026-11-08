/** Textes de l'accueil, dans ses 2 états : visiteur et connecté. */

export const HOME_VISITOR = {
  titleStart: 'Prêt(e) pour ton ',
  titleAccent: 'daily standup ?',
  subtitle: 'Track tes résultats pour que les jours ne se ressemblent pas.',
} as const

export const HOME_AUTHENTICATED = {
  titleStart: "Quoi de neuf aujourd'hui, ",
  titleAccentSuffix: ' ?',
  subtitle: 'Renseigne ton daily du jour ci-dessous.',
} as const
