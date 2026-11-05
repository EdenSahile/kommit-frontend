// Décide si le bouton de soumission d'un formulaire d'auth est désactivé (RM17),
// en combinant l'état de remplissage (RM32, RM33) et un appel déjà en cours.
// Le spinner et le libellé aria de RM17 ne sont pas décidés ici : ce sont du rendu.

// STUB — aucune logique métier ici. Implémentation à l'étape suivante du workflow.

export function isAuthSubmitDisabled(
  _isFormFilled: boolean,
  _isCallInProgress: boolean
): boolean {
  return false
}
