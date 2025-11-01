# 📧 Configuration du Système d'Envoi d'Email

Ce guide vous explique comment configurer le système d'envoi d'email automatique pour les réponses aux messages des utilisateurs.

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration EmailJS](#configuration-emailjs)
3. [Configuration de l'Application](#configuration-de-lapplication)
4. [Test du Système](#test-du-système)
5. [Dépannage](#dépannage)

---

## 🎯 Vue d'ensemble

Le système d'envoi d'email utilise **EmailJS** pour envoyer automatiquement un email à l'utilisateur lorsqu'un administrateur répond à son message via le système de gestion des messages.

### Fonctionnalités

- ✅ Envoi automatique d'email lors de la réponse admin
- ✅ Template d'email professionnel et bilingue (FR/AR)
- ✅ Fallback gracieux si l'email n'est pas configuré
- ✅ Notification de succès/échec dans l'interface
- ✅ Aucun backend requis (fonctionne 100% frontend)

### Architecture

```
User sends message via Contact Form
         ↓
Admin replies in MessagesManager
         ↓
Reply saved to Firestore
         ↓
Email sent via EmailJS ✉️
         ↓
User receives email notification
```

---

## 🔧 Configuration EmailJS

### Étape 1: Créer un compte EmailJS

1. Allez sur [https://www.emailjs.com/](https://www.emailjs.com/)
2. Cliquez sur **"Sign Up"** (gratuit jusqu'à 200 emails/mois)
3. Créez votre compte avec votre email

### Étape 2: Ajouter un Service Email

1. Une fois connecté, allez dans **"Email Services"**
2. Cliquez sur **"Add New Service"**
3. Choisissez votre fournisseur email (Gmail recommandé):
   - **Gmail**: Configuration simple avec OAuth
   - **Outlook**: Alternative si vous utilisez Microsoft
   - **Custom SMTP**: Pour tout autre fournisseur

#### Configuration Gmail (Recommandé)

1. Sélectionnez **Gmail**
2. Cliquez sur **"Connect Account"**
3. Autorisez EmailJS à accéder à votre compte Gmail
4. Donnez un nom à votre service (ex: "Edu Platform Support")
5. **Notez le Service ID** (ex: `service_abc123`)

#### Configuration Custom SMTP (Alternative)

Si vous préférez utiliser un serveur SMTP personnalisé:

1. Sélectionnez **"Custom SMTP"**
2. Remplissez les informations:
   - **SMTP Server**: `smtp.gmail.com` (ou votre serveur)
   - **Port**: `587` (TLS) ou `465` (SSL)
   - **Username**: Votre adresse email
   - **Password**: Mot de passe d'application (pas votre mot de passe normal)

### Étape 3: Créer un Template Email

1. Allez dans **"Email Templates"**
2. Cliquez sur **"Create New Template"**
3. Copiez le contenu du fichier `EMAIL_TEMPLATE.html` fourni
4. Configurez les paramètres du template:

#### Template Settings

**Subject**: `Réponse à votre message: {{subject}}`

**Content**: Collez le code HTML complet depuis `EMAIL_TEMPLATE.html`

#### Variables du Template

Assurez-vous que votre template utilise ces variables (déjà incluses si vous copiez le template fourni):

```
{{to_email}}           - Email du destinataire
{{to_name}}            - Nom du destinataire
{{subject}}            - Sujet original du message
{{original_message}}   - Message original de l'utilisateur
{{reply_message}}      - Réponse de l'admin
{{language}}           - Langue (fr ou ar)
{{reply_date}}         - Date de la réponse
{{platform_name}}      - Nom de la plateforme
{{platform_name_ar}}   - Nom en arabe
{{support_email}}      - Email de support
{{greeting}}           - Formule de salutation
{{closing}}            - Formule de politesse
```

5. Cliquez sur **"Save"**
6. **Notez le Template ID** (ex: `template_xyz789`)

### Étape 4: Obtenir votre Public Key

1. Allez dans **"Account"** → **"General"**
2. Trouvez **"Public Key"** (ex: `ABCdef123GHIjkl`)
3. **Copiez cette clé**

---

## ⚙️ Configuration de l'Application

### Étape 1: Configurer les Variables d'Environnement

1. Ouvrez le fichier `.env` à la racine du projet
2. Ajoutez les variables EmailJS (en remplaçant les valeurs):

```env
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=ABCdef123GHIjkl
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
```

⚠️ **Important**: 
- Remplacez les valeurs par celles obtenues sur EmailJS
- N'ajoutez jamais le fichier `.env` au contrôle de version (Git)
- Le fichier `.env.example` contient un modèle sans données sensibles

### Étape 2: Redémarrer le Serveur de Développement

```bash
# Arrêtez le serveur actuel (Ctrl+C)
# Puis redémarrez
npm run dev
```

---

## 🧪 Test du Système

### Test 1: Vérification de la Configuration

1. Ouvrez la console du navigateur (F12)
2. Tapez:
```javascript
import { getConfigStatus } from './src/services/emailService';
getConfigStatus();
```

Vous devriez voir:
```javascript
{
  configured: true,
  hasPublicKey: true,
  hasServiceId: true,
  hasTemplateId: true
}
```

### Test 2: Envoi d'Email de Test

1. Connectez-vous en tant qu'admin
2. Allez dans **Admin Dashboard** → **Contenu du Site** → **Messages**
3. Sélectionnez un message (ou créez-en un depuis le formulaire de contact)
4. Cliquez sur le message pour l'ouvrir
5. Écrivez une réponse dans le textarea
6. Cliquez sur **"Envoyer la Réponse"**

### Résultats Attendus

#### ✅ Si l'email est configuré correctement:

- Message dans l'interface: **"✅ Réponse envoyée avec succès et email envoyé"**
- L'utilisateur reçoit un email professionnel
- La réponse est sauvegardée dans Firestore
- Le statut du message passe à "replied"

#### ⚠️ Si l'email n'est pas configuré:

- Message dans l'interface: **"✅ Réponse sauvegardée (email non configuré)"**
- La réponse est quand même sauvegardée dans Firestore
- Aucun email n'est envoyé (système continue de fonctionner)

#### ❌ Si l'email échoue:

- Message dans l'interface: **"✅ Réponse sauvegardée (email non envoyé)"**
- La réponse est sauvegardée dans Firestore
- Erreur détaillée dans la console du navigateur

### Test 3: Vérifier l'Email Reçu

1. Connectez-vous à l'email de l'utilisateur de test
2. Vérifiez la boîte de réception (peut prendre 1-2 minutes)
3. L'email devrait contenir:
   - En-tête avec le nom de la plateforme
   - La réponse de l'admin
   - Le message original (pour contexte)
   - Signature et informations de contact

---

## 🐛 Dépannage

### Problème: "Email service not configured"

**Symptômes**: 
- Message "email non configuré" dans l'interface
- Console affiche: `EmailJS is not configured`

**Solutions**:
1. Vérifiez que les variables d'environnement sont définies dans `.env`
2. Assurez-vous que les noms commencent par `VITE_` (requis pour Vite)
3. Redémarrez le serveur de développement (`npm run dev`)
4. Vérifiez qu'il n'y a pas d'espaces dans les valeurs

### Problème: Email non envoyé mais pas d'erreur

**Symptômes**:
- Message "réponse sauvegardée" mais aucun email reçu
- Pas d'erreur dans la console

**Solutions**:
1. Vérifiez les spams/courrier indésirable
2. Vérifiez le quota EmailJS (max 200 emails/mois en gratuit)
3. Vérifiez que le template ID et service ID sont corrects
4. Testez directement sur EmailJS Dashboard

### Problème: "Invalid template parameters"

**Symptômes**:
- Erreur: `The template parameters are invalid`
- Email non envoyé

**Solutions**:
1. Vérifiez que toutes les variables du template existent dans le code
2. Comparez les variables dans `emailService.js` avec celles du template EmailJS
3. Assurez-vous qu'il n'y a pas de faute de frappe dans les noms de variables

### Problème: "CORS error" ou "Network error"

**Symptômes**:
- Erreur réseau dans la console
- Email non envoyé

**Solutions**:
1. Vérifiez votre connexion Internet
2. Vérifiez que EmailJS n'est pas bloqué par un pare-feu
3. Désactivez temporairement les extensions de navigateur (AdBlock, etc.)
4. Vérifiez le statut d'EmailJS sur leur site

### Problème: Gmail bloque les emails

**Symptômes**:
- EmailJS dit "success" mais aucun email reçu
- Gmail affiche une erreur d'authentification

**Solutions**:
1. Activez l'accès des applications moins sécurisées (Gmail)
2. Utilisez un mot de passe d'application (Settings → Security → App passwords)
3. Vérifiez que OAuth est correctement configuré dans EmailJS

### Debug Avancé

Pour obtenir plus d'informations sur les erreurs:

```javascript
// Dans la console du navigateur
localStorage.setItem('emailjs_debug', 'true');
```

Puis essayez d'envoyer un email et vérifiez les logs détaillés dans la console.

---

## 📊 Limites du Plan Gratuit EmailJS

- **200 emails/mois** maximum
- **Support email uniquement** (pas de téléphone)
- **1 template** maximum
- **Branding EmailJS** dans les emails

Pour augmenter ces limites, consultez [les plans payants d'EmailJS](https://www.emailjs.com/pricing/).

---

## 🔒 Sécurité

### Bonnes Pratiques

1. ✅ **Ne jamais** commiter le fichier `.env` dans Git
2. ✅ Utiliser des variables d'environnement différentes pour dev/prod
3. ✅ Limiter les domaines autorisés dans EmailJS Dashboard
4. ✅ Surveiller l'utilisation pour détecter les abus
5. ✅ Utiliser un compte email dédié (pas votre email personnel)

### Configuration de Sécurité EmailJS

1. Dans EmailJS Dashboard → **Security**
2. Activez **"Restrict Access"**
3. Ajoutez vos domaines autorisés:
   - `http://localhost:5173` (développement)
   - `https://yourdomain.com` (production)

---

## 🎨 Personnalisation du Template

Le template HTML fourni (`EMAIL_TEMPLATE.html`) peut être personnalisé:

### Modifier les Couleurs

```css
/* Header background gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary color for borders and buttons */
border-left-color: #667eea;
background-color: #667eea;
```

### Ajouter un Logo

Ajoutez ceci dans la section `<div class="header">`:

```html
<img src="https://your-domain.com/logo.png" 
     alt="Logo" 
     style="max-width: 150px; margin-bottom: 20px;">
```

### Modifier le Texte

Toutes les chaînes de texte sont personnalisables dans le template.

---

## 🌐 Support Multilingue

Le système supporte le français et l'arabe:

- Détection automatique de la langue (paramètre `isArabic`)
- Formules de salutation adaptées
- Direction RTL pour l'arabe
- Dates formatées selon la locale

Pour ajouter une autre langue, modifiez `src/services/emailService.js` et ajoutez vos traductions.

---

## 📚 Ressources Supplémentaires

- [Documentation EmailJS](https://www.emailjs.com/docs/)
- [API Reference EmailJS](https://www.emailjs.com/docs/sdk/send/)
- [Forum de Support EmailJS](https://www.emailjs.com/community/)

---

## ✅ Checklist de Configuration

Utilisez cette checklist pour vous assurer que tout est configuré:

- [ ] Compte EmailJS créé
- [ ] Service email ajouté (Gmail/Outlook/SMTP)
- [ ] Template email créé avec les bonnes variables
- [ ] Public Key copiée
- [ ] Service ID copié
- [ ] Template ID copié
- [ ] Variables ajoutées au fichier `.env`
- [ ] Serveur redémarré
- [ ] Email de test envoyé avec succès
- [ ] Email reçu et vérifié
- [ ] Restrictions de sécurité configurées sur EmailJS

---

## 🆘 Besoin d'Aide?

Si vous rencontrez des problèmes non couverts dans ce guide:

1. Vérifiez la console du navigateur pour les erreurs détaillées
2. Consultez les logs d'EmailJS Dashboard
3. Testez avec l'outil de test intégré d'EmailJS
4. Contactez le support EmailJS si nécessaire

---

**Dernière mise à jour**: 2025-10-31  
**Version**: 1.0.0
