# Documentation des Server Actions - SAMBAFITNESS-V2

Toutes les Server Actions sont exécutées côté serveur Next.js avec isolation des secrets Supabase et validation Zod stricte.

---

## 1. Actions Publiques (Site Vitrine)

### `submitTrialAction(prevState, formData)`
- **Fichier** : `app/actions/submit-trial.ts`
- **Rôle** : Enregistrement d'un prospect depuis le formulaire d'inscription / séance d'essai.
- **Validation** : `trialFormSchema` (Zod)
  - `name` : Nom complet (min 2 car.)
  - `phone` : Numéro sénégalais valide (+221, 70, 75, 76, 77, 78, 33...) ou international
  - `salle` : Salle sélectionnée
  - `message` : Message optionnel
- **Retour** : `{ success: boolean, message: string, errors?: Record<string, string> }`

---

## 2. Actions Administrateur (Gestion Salle de Sport)

Toutes ces actions sont protégées par le garde `requireAdmin(minRole)`.

### `saveMemberAction(data)`
- **Rôle** : Création ou modification d'un adhérent.
- **Rôle minimal requis** : `receptionist`
- **Validation** : `memberSchema` (Zod)
- **Retour** : `ActionResult<{ member: Member }>`

### `deleteMemberAction(id)`
- **Rôle** : Suppression définitive d'un membre.
- **Rôle minimal requis** : `super_admin`
- **Retour** : `ActionResult`

### `recordPaymentAction(data)`
- **Rôle** : Enregistrement d'un encaissement (Espèces, Wave, Orange Money).
- **Rôle minimal requis** : `receptionist`
- **Validation** : `paymentSchema` (Zod)
- **Retour** : `ActionResult<{ payment: Payment; updatedMember: Member | null }>`

### `recordAttendanceAction(memberId, method)`
- **Rôle** : Pointage d'une entrée à la salle (manuel ou scan QR code).
- **Rôle minimal requis** : `receptionist`
- **Retour** : `ActionResult<{ attendance: Attendance; isExpired: boolean; memberName: string }>`

### `convertLeadToMemberAction(leadId, data)`
- **Rôle** : Convertit un prospect en membre adhérent avec abonnement et paiement initial optionnel.
- **Rôle minimal requis** : `receptionist`
- **Validation** : `convertLeadSchema` (Zod)
- **Retour** : `ActionResult<{ member: Member }>`
