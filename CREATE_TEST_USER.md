# 📋 Créer un Étudiant de Test pour Vérifier l'Email

## Situation Actuelle:
Tous les utilisateurs sont déjà "Actif" (approuvés).
Il n'y a personne en attente d'approbation.

## ✅ Solution: Créer un Nouvel Étudiant

### Étape 1: Déconnexion
1. En haut à droite, cliquez sur votre nom
2. Cliquez sur **"Sign Out"** ou **"Déconnexion"**

### Étape 2: Inscription
1. Sur la page d'accueil, cliquez sur **"S'inscrire"**
2. Remplissez le formulaire:
   ```
   Nom complet: Debug Email Test
   Email: UN_NOUVEAU_EMAIL_DIFFERENT@gmail.com
   ⚠️ Important: Utilisez un email DIFFÉRENT des précédents!
   Mot de passe: Test123!
   
   Niveau: 2BAC (ou autre)
   Branche: PC (ou autre)
   Classe: Choisissez une classe
   
   Rôle: Étudiant
   ```
3. Cliquez sur **"S'inscrire"**
4. Vous verrez la page "En Attente d'Approbation"

### Étape 3: Reconnexion Admin
1. Déconnectez-vous de l'étudiant
2. Reconnectez-vous en tant qu'**Admin**:
   - Email: `e.belqasim@gmail.com` (ou votre admin)
   - Mot de passe: votre mot de passe admin

### Étape 4: Préparer la Console
1. **Appuyez sur F12**
2. Allez dans l'onglet **"Console"**
3. Cliquez sur l'icône **🗑️** pour effacer les anciens logs
4. **LAISSEZ LA CONSOLE OUVERTE!**

### Étape 5: Approuver avec Console Ouverte
1. Allez dans **"Gestion des Utilisateurs"**
2. Trouvez **"Debug Email Test"** avec statut **"En attente"** (jaune)
3. Cliquez sur ✅ **"Approuver"**
4. **IMMÉDIATEMENT, regardez la console!**

### Étape 6: Observer les Logs
Vous devriez voir apparaître:
```javascript
📧 [Approval] User found: {id: "...", email: "votre@email.com", fullName: "Debug Email Test", ...}
📧 [Approval] EmailJS configured: true
✅ [Approval] User status updated in Firestore
📧 [Approval] Sending email to: votre@email.com

📧 [sendApprovalEmail] Starting...
📧 [sendApprovalEmail] To: votre@email.com Name: Debug Email Test Lang: fr
📧 [sendApprovalEmail] Configuration status: {
  configured: true,
  publicKey: true,
  serviceId: true,
  templateId: true
}
📧 [sendApprovalEmail] Template params: {
  to_email: "votre@email.com",
  email: "votre@email.com",       ← Important!
  to_name: "Debug Email Test",
  name: "Debug Email Test",       ← Important!
  subject: "Votre inscription est approuvée",
  message: "Bonjour Debug Email Test,\n\nVotre inscription...",
  platform_name: "Plateforme Éducative Marocaine",
  approval_date: "31 octobre 2025"
}
📧 [sendApprovalEmail] Sending via EmailJS...
📧 [sendApprovalEmail] Service: service_lcskdxo
📧 [sendApprovalEmail] Template: template_il00l6d

✅ [sendApprovalEmail] Email sent successfully!
✅ [sendApprovalEmail] Response: {status: 200, text: "OK"}

📧 [Approval] Email result: {success: true, message: "Notification d'approbation envoyée"}
```

### Étape 7: Vérifier le Toast
Un toast devrait apparaître en haut à droite:
```
✅ Utilisateur approuvé et notifié par email
```

### Étape 8: Copier les Logs
1. Dans la console, **sélectionnez TOUS les nouveaux logs**
2. **Clic droit** → **Copy**
3. **Collez-les dans le chat** pour me les envoyer

### Étape 9: Vérifier l'Email
Allez sur la boîte email que vous avez utilisée:
- Boîte de réception
- Spam/Courrier indésirable
- Promotions

Cherchez un email avec:
```
De: e.belqasim@gmail.com
Sujet: Votre inscription est approuvée (ou Welcome to...)
```

---

## ⚠️ Important:

- **Email différent**: N'utilisez pas `belqasim@gmail.com`, `ob.elmamoun@gmail.com` ou d'autres déjà utilisés
- **Console ouverte**: F12 AVANT de cliquer sur Approuver
- **Copiez TOUT**: Envoyez-moi tous les logs, même s'il y a une erreur

---

## 🎯 Pourquoi Cette Procédure:

Tous les utilisateurs existants sont déjà approuvés. Pour tester l'envoi d'email avec les nouveaux logs de débogage, nous devons créer un NOUVEL utilisateur en attente.

Les logs nous diront exactement:
- ✅ Si EmailJS est configuré
- ✅ Si toutes les variables sont envoyées
- ✅ Si l'email est envoyé avec succès
- ❌ Ou quelle erreur se produit exactement

---

**Suivez ces étapes et envoyez-moi les logs de la console!** 📋
