# 📧 Guide pour créer le Template de Réponse aux Messages de Contact

## 🚨 Problème Identifié

Le système utilise actuellement **le même template EmailJS** pour:
1. ✅ Les notifications d'approbation d'inscription
2. ❌ Les réponses aux messages de contact (PROBLÈME: envoie des messages vides)

**Solution**: Créer un **template séparé** pour les réponses de contact.

---

## 📝 Étape 1: Créer le Template dans EmailJS

### 1.1 Accéder à EmailJS Dashboard
1. Allez sur: https://dashboard.emailjs.com/
2. Connectez-vous avec votre compte
3. Cliquez sur **"Email Templates"** dans le menu de gauche

### 1.2 Créer un Nouveau Template
1. Cliquez sur **"Create New Template"**
2. Donnez-lui un nom: **"Contact Form Reply Template"**

---

## 📋 Étape 2: Configuration du Template

### 2.1 Configuration de Base

**Settings (Paramètres):**
- **Template Name**: Contact Form Reply Template
- **Template ID**: *(EmailJS génère automatiquement, par exemple: `template_abc123`)*

**Email Configuration:**
```
From Name:     Plateforme Éducative Marocaine
From Email:    [Votre email vérifié dans EmailJS]
To Email:      {{to_email}}
Reply To:      {{email}}
Subject:       Réponse à: {{subject}}
```

---

### 2.2 Template HTML (Corps du message)

**Version Simple et Claire:**

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #e0e0e0;
        }
        .original-message {
            background: #fff;
            border-left: 4px solid #667eea;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .reply-message {
            background: #fff;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border: 2px solid #667eea;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #888;
            font-size: 12px;
            background: #f0f0f0;
            border-radius: 0 0 10px 10px;
        }
        .label {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📧 Réponse à votre message</h1>
        <p>{{platform_name}}</p>
    </div>
    
    <div class="content">
        <p>{{greeting}}</p>
        
        <p>Nous avons bien reçu votre message et voici notre réponse :</p>
        
        <div class="reply-message">
            <div class="label">📝 Notre réponse:</div>
            <p style="white-space: pre-wrap;">{{reply_message}}</p>
        </div>
        
        <div class="original-message">
            <div class="label">💬 Votre message initial ({{reply_date}}):</div>
            <p><strong>Sujet:</strong> {{subject}}</p>
            <p style="white-space: pre-wrap;">{{original_message}}</p>
        </div>
        
        <p>Si vous avez d'autres questions, n'hésitez pas à nous contacter.</p>
        
        <p>{{closing}}</p>
    </div>
    
    <div class="footer">
        <p>{{platform_name}}</p>
        <p>Email: {{support_email}}</p>
        <p>Cet email a été envoyé automatiquement, veuillez ne pas y répondre directement.</p>
    </div>
</body>
</html>
```

---

## 🔑 Étape 3: Variables du Template

Assurez-vous que votre template utilise ces variables (EmailJS remplacera automatiquement):

### Variables Principales:
- `{{to_email}}` - Email du destinataire (utilisateur qui a envoyé le message)
- `{{email}}` - Email pour Reply To
- `{{name}}` / `{{to_name}}` - Nom du destinataire
- `{{subject}}` - Sujet du message original
- `{{original_message}}` - Message original de l'utilisateur
- `{{reply_message}}` - Réponse de l'admin
- `{{message}}` - Alternative pour reply_message

### Variables Secondaires:
- `{{platform_name}}` - "Plateforme Éducative Marocaine"
- `{{support_email}}` - "support@edu-platform.ma"
- `{{reply_date}}` - Date et heure de la réponse
- `{{greeting}}` - Salutation (Bonjour X, / مرحباً X،)
- `{{closing}}` - Formule de politesse

---

## ⚙️ Étape 4: Configuration dans l'Application

### 4.1 Copier le Template ID

1. Dans EmailJS Dashboard, après avoir créé le template
2. Copiez le **Template ID** (exemple: `template_abc123`)
3. Ce sera visible dans la liste des templates

### 4.2 Mettre à Jour le fichier `.env`

Ouvrez le fichier `/home/user/webapp/.env` et ajoutez:

```env
# EmailJS Contact Reply Template
VITE_EMAILJS_CONTACT_REPLY_TEMPLATE_ID=template_VOTRE_ID_ICI
```

**Exemple:**
```env
VITE_EMAILJS_CONTACT_REPLY_TEMPLATE_ID=template_abc123
```

### 4.3 Redémarrer le Serveur

Après avoir modifié le `.env`, redémarrez l'application pour que les changements prennent effet.

---

## 🧪 Étape 5: Test

### Test 1: Envoyer un Message de Contact
1. Allez sur la page Contact
2. Envoyez un message test
3. Connectez-vous comme admin
4. Répondez au message depuis "Gestion des Messages"

### Test 2: Vérifier les Logs Console
Ouvrez la console (F12) et cherchez:
```
📧 [sendReplyEmail] Starting...
📧 [sendReplyEmail] Using template: template_abc123
✅ [sendReplyEmail] Email sent successfully
```

### Test 3: Vérifier l'Email Reçu
1. Consultez l'email du destinataire
2. Vérifiez que:
   - ✅ Le sujet est correct
   - ✅ Le message original est affiché
   - ✅ La réponse de l'admin est affichée
   - ✅ La mise en forme est correcte

---

## 📊 Templates Actuels du Système

| Template | Utilisation | ID | Status |
|----------|-------------|-----|--------|
| **Approbation d'Inscription** | Notification quand un étudiant est approuvé | `template_il00l6d` | ✅ Configuré |
| **Réponse aux Messages** | Réponse aux messages de contact | `À CRÉER` | ❌ Non configuré |

---

## ⚠️ Note Importante

**Si vous ne créez pas le template de contact:**
- Le système utilisera le template d'approbation par défaut
- Les emails seront envoyés mais avec le mauvais format
- Les variables ne correspondront pas → message vide/incomplet

**Une fois le template de contact créé:**
- Les emails auront le bon format
- Les messages originaux et les réponses seront correctement affichés
- L'expérience utilisateur sera améliorée

---

## 🆘 Aide

Si vous rencontrez des problèmes:

1. **Vérifier les logs console** - Activez F12 > Console
2. **Tester avec EmailJS Dashboard** - Utilisez le test intégré
3. **Vérifier les variables** - Assurez-vous qu'elles correspondent
4. **Vérifier le Service ID** - Doit être le même pour tous les templates

---

## ✅ Checklist Finale

- [ ] Template créé dans EmailJS Dashboard
- [ ] Variables correctement configurées
- [ ] Template ID copié
- [ ] `.env` mis à jour avec `VITE_EMAILJS_CONTACT_REPLY_TEMPLATE_ID`
- [ ] Serveur redémarré
- [ ] Test d'envoi effectué
- [ ] Email reçu et vérifié

---

**Date de création**: 2025-10-31
**Version**: 1.0
