# 🧪 Guide de Test - Email d'Approbation d'Étudiant

## ✅ Configuration Actuelle

**Template EmailJS**: `template_il00l6d`
- ✅ Configuré dans `.env`
- ✅ Variables utilisées: `{{to_email}}`, `{{platform_name}}`, `{{message}}`, `{{approval_date}}`

**Service actif**: https://5175-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai

---

## 📋 Étapes de Test

### 1. Créer un Étudiant de Test

1. **Ouvrir l'application**: https://5175-ilduq64rs6h1t09aiw60g-0e616f0a.sandbox.novita.ai
2. **Cliquer sur "S'inscrire"**
3. **Remplir le formulaire**:
   - Nom complet: `Test Student`
   - Email: **VOTRE EMAIL RÉEL** (pour recevoir la notification)
   - Mot de passe: `Test123!`
   - Rôle: **Étudiant**
4. **Soumettre l'inscription**
5. **Status**: L'étudiant sera en attente d'approbation

---

### 2. Approuver l'Étudiant (En tant qu'Admin)

1. **Se connecter en tant qu'Admin**:
   - Email: `admin@edu.ma` (ou votre compte admin)
   - Mot de passe: votre mot de passe admin

2. **Aller à la gestion des utilisateurs**:
   - Menu: **"Gestion des Utilisateurs"** ou **"Users Management"**

3. **Trouver l'étudiant de test**:
   - Chercher "Test Student"
   - Status: "En attente" / "Pending"

4. **Cliquer sur le bouton "Approuver"** ✅

---

### 3. Vérifier l'Email Reçu

**L'étudiant devrait recevoir un email avec**:

#### 📧 Version Française:
```
Sujet: Votre inscription est approuvée

Bonjour Test Student,

Votre inscription sur la plateforme éducative a été approuvée.
Vous pouvez maintenant vous connecter et accéder à tous les cours.

Cordialement,
L'équipe de la plateforme éducative
```

#### 📧 Version Arabe (si interface en arabe):
```
الموضوع: تم قبول تسجيلك

مرحباً Test Student،

تم قبول تسجيلك في المنصة التعليمية.
يمكنك الآن تسجيل الدخول والوصول إلى جميع الدروس.

مع أطيب التحيات،
فريق المنصة التعليمية
```

---

## 🔍 Vérifications

### Dans l'Interface Admin:
- ✅ Toast notification: **"✅ Utilisateur approuvé et notifié par email"**
- ✅ Status de l'étudiant change à: **"Actif"**
- ✅ Badge vert apparaît

### Dans la Boîte Email de l'Étudiant:
- ✅ Email reçu de: `e.belqasim@gmail.com` (Reply-To configuré dans EmailJS)
- ✅ Sujet clair
- ✅ Message simple et professionnel
- ✅ Date d'approbation affichée

---

## 🐛 Dépannage

### Si l'email n'est PAS envoyé:

1. **Vérifier la console du navigateur** (F12):
   ```
   Error sending approval email: ...
   ```

2. **Vérifier les credentials EmailJS** dans `.env`:
   ```bash
   VITE_EMAILJS_PUBLIC_KEY=cGCZvvD5qBCgFAl9k
   VITE_EMAILJS_SERVICE_ID=service_lcskdxo
   VITE_EMAILJS_TEMPLATE_ID=template_il00l6d
   ```

3. **Vérifier le quota EmailJS**:
   - Dashboard EmailJS: https://dashboard.emailjs.com
   - Onglet "Usage" → Vérifier les requêtes restantes (197/200)

4. **Vérifier le template EmailJS**:
   - Le template `template_il00l6d` doit contenir:
     - `{{to_email}}` dans "To Email"
     - `{{platform_name}}` dans le contenu
     - `{{message}}` dans le corps
     - `{{approval_date}}` dans le footer (optionnel)

### Si l'email va à la mauvaise adresse:

- **Vérifier dans EmailJS Dashboard** → Template `template_il00l6d`:
  - Champ "To Email" = `{{to_email}}` ✅
  - PAS `{{from_email}}` ❌

---

## 📊 Code Flow

```
Étudiant s'inscrit
    ↓
Firestore (users collection)
    ↓ status: "pending"
Admin ouvre UserManagement
    ↓
Admin clique "Approuver"
    ↓
handleApproveUser() appelé
    ↓
1. Update Firestore: status → "active", approved → true
    ↓
2. sendApprovalEmail() appelé avec:
   - toEmail: user.email (EMAIL DE L'ÉTUDIANT)
   - toName: user.fullName
   - language: 'fr' ou 'ar'
    ↓
3. EmailJS envoie l'email
    ↓
4. Toast notification: "✅ Utilisateur approuvé et notifié par email"
    ↓
L'ÉTUDIANT reçoit l'email dans sa boîte! 📧
```

---

## ✨ Fonctionnalités Incluses

1. **Email automatique** lors de l'approbation
2. **Support bilingue** (FR/AR) selon la langue de l'interface
3. **Message simple et clair** sans détails inutiles (comme demandé)
4. **Graceful degradation**: Si EmailJS n'est pas configuré, l'approbation fonctionne quand même
5. **Feedback utilisateur**: Toast notifications pour l'admin

---

## 🎯 Prochaines Étapes

Après avoir testé et vérifié que tout fonctionne:

1. ✅ Tester avec un vrai email
2. ✅ Vérifier le format du message
3. ✅ Tester en français ET en arabe
4. ✅ Vérifier la réception dans différents clients email (Gmail, Outlook, etc.)
5. ✅ Commit et push si des ajustements sont nécessaires

---

**Date de création**: 31 Octobre 2025
**Template ID**: `template_il00l6d`
**Status**: ✅ Prêt pour test
