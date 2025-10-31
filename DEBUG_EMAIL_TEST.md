# 🔍 Guide de Débogage - Email d'Approbation

## 📍 URL de Test
https://5175-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai

## 🎯 Étapes de Test avec Console

### 1. Créer un Étudiant de Test

1. Ouvrir l'URL ci-dessus
2. Ouvrir la **Console JavaScript** (F12 → Console)
3. Cliquer sur **"S'inscrire"**
4. Remplir le formulaire:
   ```
   Nom complet: Test Email Student
   Email: VOTRE_VRAI_EMAIL@gmail.com  ← Important!
   Mot de passe: Test123!
   Rôle: Étudiant
   ```
5. Soumettre l'inscription
6. **Noter les logs** dans la console

---

### 2. Se Connecter comme Admin

1. Aller sur la page de connexion
2. **Ouvrir Console (F12)** si pas déjà ouverte
3. Se connecter avec:
   ```
   Email: admin@edu.ma (ou votre compte admin)
   Mot de passe: [votre mot de passe]
   ```

---

### 3. Approuver l'Étudiant avec Logs

1. Menu → **"Gestion des Utilisateurs"**
2. **Garder la Console ouverte!** (F12)
3. Trouver "Test Email Student" (status: En attente)
4. Cliquer sur ✅ **"Approuver"**

---

### 4. Observer les Logs de Débogage

Vous devriez voir ces logs dans la console:

```javascript
📧 [Approval] User found: {id: "xxx", email: "votre@email.com", fullName: "Test Email Student", ...}
📧 [Approval] EmailJS configured: true
✅ [Approval] User status updated in Firestore
📧 [Approval] Sending email to: votre@email.com

📧 [sendApprovalEmail] Starting...
📧 [sendApprovalEmail] To: votre@email.com Name: Test Email Student Lang: fr
📧 [sendApprovalEmail] Configuration status: {configured: true, publicKey: true, serviceId: true, templateId: true}
📧 [sendApprovalEmail] Template params: {to_email: "...", to_name: "...", subject: "...", ...}
📧 [sendApprovalEmail] Sending via EmailJS...
📧 [sendApprovalEmail] Service: service_lcskdxo
📧 [sendApprovalEmail] Template: template_il00l6d

✅ [sendApprovalEmail] Email sent successfully!
✅ [sendApprovalEmail] Response: {status: 200, text: "OK"}

📧 [Approval] Email result: {success: true, message: "Notification d'approbation envoyée"}
```

---

## ✅ Cas de Succès

Si vous voyez ces logs:
- `✅ [sendApprovalEmail] Email sent successfully!`
- `✅ [Approval] Email result: {success: true, ...}`
- Toast: **"✅ Utilisateur approuvé et notifié par email"**

**→ L'email a été envoyé!** Vérifiez votre boîte de réception.

---

## ❌ Cas d'Erreur - EmailJS Non Configuré

Si vous voyez:
```javascript
📧 [sendApprovalEmail] Configuration status: {configured: false, ...}
⚠️ [sendApprovalEmail] EmailJS is not configured
⚠️ [Approval] Email not sent - User: true, Configured: false
```

**Problème**: Variables d'environnement non chargées

**Solution**:
1. Vérifier que `.env` contient:
   ```
   VITE_EMAILJS_PUBLIC_KEY=cGCZvvD5qBCgFAl9k
   VITE_EMAILJS_SERVICE_ID=service_lcskdxo
   VITE_EMAILJS_TEMPLATE_ID=template_il00l6d
   ```
2. Redémarrer le serveur (le serveur Vite recharge automatiquement)

---

## ❌ Cas d'Erreur - Échec d'Envoi EmailJS

Si vous voyez:
```javascript
❌ [sendApprovalEmail] Error sending approval email: ...
❌ [sendApprovalEmail] Error details: {message: "...", text: "...", status: ...}
❌ [Approval] Email failed: ...
```

**Problèmes possibles**:

### A. Template Incorrect
```
Error: Template ID not found
```
**Solution**: Vérifier que `template_il00l6d` existe dans EmailJS Dashboard

### B. Service Inactif
```
Error: Service not found
```
**Solution**: Vérifier que `service_lcskdxo` est actif dans EmailJS Dashboard

### C. Quota Dépassé
```
Error: Quota exceeded
```
**Solution**: Vérifier le quota dans EmailJS Dashboard (197/200 disponible normalement)

### D. Champ Template Manquant
```
Error: Missing required template parameter
```
**Solution**: Vérifier que le template contient tous les champs:
- `{{to_email}}` - Dans "To Email"
- `{{platform_name}}` - Dans le contenu
- `{{message}}` - Dans le corps du message
- `{{approval_date}}` - Dans le footer (optionnel)

---

## 📧 Vérifier l'Email Reçu

Si tout fonctionne, vous devriez recevoir:

```
De: e.belqasim@gmail.com (via EmailJS)
À: votre@email.com

Sujet: Votre inscription est approuvée

Plateforme Éducative Marocaine

Bonjour Test Email Student,

Votre inscription sur la plateforme éducative a été approuvée.
Vous pouvez maintenant vous connecter et accéder à tous les cours.

Cordialement,
L'équipe de la plateforme éducative

31 octobre 2025
```

---

## 🔧 Actions de Dépannage

### Si EmailJS n'est pas configuré:
```bash
# Vérifier les variables d'environnement
cat .env | grep EMAILJS

# Devrait afficher:
# VITE_EMAILJS_PUBLIC_KEY=cGCZvvD5qBCgFAl9k
# VITE_EMAILJS_SERVICE_ID=service_lcskdxo
# VITE_EMAILJS_TEMPLATE_ID=template_il00l6d
```

### Si le serveur ne voit pas les changements:
1. Arrêter le serveur (Ctrl+C)
2. Relancer: `npm run dev`
3. Attendre que Vite soit prêt
4. Rafraîchir la page (Ctrl+Shift+R pour hard refresh)

---

## 📸 Screenshots à Prendre

Pour le débogage, prenez des screenshots de:

1. **Console logs** pendant l'approbation
2. **Toast notification** après l'approbation
3. **EmailJS Dashboard** → Usage/Stats
4. **EmailJS Template** `template_il00l6d` configuration
5. **Email reçu** (ou dossier spam si non reçu)

---

## ✅ Checklist de Vérification

- [ ] `.env` contient les 3 variables VITE_EMAILJS_*
- [ ] Serveur Vite redémarré après modification .env
- [ ] Console JavaScript ouverte (F12)
- [ ] Étudiant de test créé avec VRAI email
- [ ] Admin connecté
- [ ] Approuvé l'étudiant ET observé les logs
- [ ] Vérifié toast notification
- [ ] Vérifié boîte email (inbox + spam)

---

**Date**: 31 Octobre 2025
**Template**: template_il00l6d
**Version**: Avec logs de débogage détaillés
