# 🔐 Configuration Admin & Firestore

## ⚠️ PROBLÈMES DÉTECTÉS DANS LES LOGS

D'après les logs de la console, voici ce qui se passe :

### 1. ❌ Erreur d'Index Firestore (TeacherDashboard)
```
Error fetching courses: FirebaseError: The query requires an index.
```

**Solution :** L'index Firestore doit être créé. Voici comment :

---

## 🔥 CRÉER LES INDEX FIRESTORE

### Option 1 : Via le Lien Direct (Plus Rapide)
Firestore vous a donné un lien pour créer l'index automatiquement :

**Cliquez sur ce lien :**
```
https://console.firebase.google.com/v1/r/project/eduinfor-fff3d/firestore/indexes?create_composite=Ck5wcm9qZWN0cy9lZHVpbmZvci1mZmYzZC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvY291cnNlcy9pbmRleGVzL18QARoNCgljcmVhdGVkQnkQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC
```

**Ensuite :**
1. Connectez-vous à Firebase Console
2. Le formulaire de création d'index sera pré-rempli
3. Cliquez sur **"Créer l'index"**
4. Attendez 2-5 minutes que l'index soit créé
5. ✅ L'erreur disparaîtra

---

### Option 2 : Créer Manuellement

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet : **eduinfor-fff3d**
3. Menu latéral → **Firestore Database**
4. Onglet **"Indexes"** (en haut)
5. Cliquez sur **"Create Index"**

**Configuration de l'index :**
- **Collection :** `courses`
- **Fields to index :**
  1. Field: `createdBy` → Order: `Ascending`
  2. Field: `createdAt` → Order: `Descending`
- **Query scope :** Collection
- Cliquez **"Create"**

---

## 👤 CRÉER UN COMPTE ADMINISTRATEUR

### Pourquoi ?
Les logs montrent :
```
NotificationContext.jsx:27 ⚠️ Notification listener NOT started - user is not admin
```

**Vous êtes connecté avec :**
- Role: `student` (élève)
- Role: `teacher` (professeur)

**Pour tester les notifications, vous devez être `admin` !**

---

### Méthode 1 : Via l'Application (Plus Simple)

#### Étape 1 : Aller à la Page SetupAdmin
Ouvrez : https://5173-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/setup-admin

#### Étape 2 : Créer le Compte Admin
1. **Nom complet :** Votre nom (ex: "Admin Principal")
2. **Email :** admin@lycee.ma (ou votre email)
3. **Mot de passe :** Choisissez un mot de passe fort
4. Cliquez **"Créer le compte administrateur"**

#### Étape 3 : Se Connecter
1. Déconnectez-vous si nécessaire
2. Connectez-vous avec l'email/mot de passe admin
3. Vous serez redirigé vers le dashboard admin
4. **Les notifications apparaîtront maintenant !** 🔔

---

### Méthode 2 : Modifier un Utilisateur Existant (Firestore Console)

Si vous voulez transformer votre compte actuel en admin :

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez **eduinfor-fff3d**
3. **Firestore Database**
4. Collection **"users"**
5. Trouvez votre utilisateur (par email)
6. Cliquez dessus pour éditer
7. **Modifiez ces champs :**
   ```
   role: "admin"
   approved: true
   status: "active"
   ```
8. Cliquez **"Update"**
9. **Déconnectez-vous et reconnectez-vous**

---

## 🧪 TESTER LES NOTIFICATIONS (Admin uniquement)

Une fois connecté en tant qu'**admin** :

### Test 1 : Créer des Données de Test

#### A. Message de Contact
1. Ouvrez l'application dans un **autre navigateur** (ou mode privé)
2. Allez à la page d'accueil
3. Section **Contact** (en bas)
4. Remplissez :
   ```
   Nom: Test User
   Email: test@test.com
   Sujet: Test de notification
   Message: Ceci est un test
   ```
5. Envoyez

#### B. Inscription Étudiant
1. Dans le même navigateur (ou onglet privé)
2. Créez un compte avec rôle **"Élève"**
   ```
   Nom: Étudiant Test
   Email: etudiant-test@test.com
   Mot de passe: Test123456
   Rôle: Élève
   ```
3. Le compte sera en status "pending"

---

### Test 2 : Vérifier les Notifications (Admin)

1. **Retournez sur votre navigateur admin**
2. **Ouvrez la console (F12)**
3. **Cherchez ces logs :**
   ```javascript
   🔔 NotificationContext mounted: { currentUser: true, isAdmin: true, userRole: 'admin' }
   ✅ Starting notification listeners for admin...
   📊 Users snapshot received: 1 pending users
   👤 Pending user: { id: '...', fullName: 'Étudiant Test', status: 'pending' }
   📨 Messages snapshot received: 1 pending messages
   ✉️ Pending message: { id: '...', from: 'Test User', subject: 'Test de notification' }
   🔔 Total notifications: 2 (2 unread)
   ```

4. **Regardez en haut à droite de la sidebar**
5. Vous devriez voir **🔔 avec un badge rouge "2"**
6. **Cliquez sur la cloche**
7. Le panneau s'ouvre avec les 2 notifications

---

## 🔍 VÉRIFIER L'ÉTAT ACTUEL

### Dans la Console du Navigateur (F12)

**Si vous voyez :**
```
⚠️ Notification listener NOT started - user is not admin
```

→ **Vous n'êtes PAS connecté en tant qu'admin**  
→ Solution : Créez un compte admin (voir ci-dessus)

**Si vous voyez :**
```
✅ Starting notification listeners for admin...
📊 Users snapshot received: 0 pending users
📨 Messages snapshot received: 0 pending messages
```

→ **Vous êtes admin, mais il n'y a pas de notifications**  
→ Solution : Créez des données de test (voir Test 1)

**Si vous voyez :**
```
✅ Starting notification listeners for admin...
📊 Users snapshot received: 2 pending users
📨 Messages snapshot received: 1 pending messages
🔔 Total notifications: 3 (3 unread)
```

→ **✅ PARFAIT ! Les notifications fonctionnent !**

---

## 📊 ARCHITECTURE DES RÔLES

| Rôle | Peut voir notifications ? | Dashboard |
|------|---------------------------|-----------|
| **admin** | ✅ Oui | Admin Dashboard (gestion complète) |
| **teacher** | ❌ Non | Teacher Dashboard (ses cours) |
| **student** | ❌ Non | Student Dashboard (cours disponibles) |

**Les notifications sont UNIQUEMENT pour les admins** car elles concernent :
- Nouvelles inscriptions d'étudiants (besoin d'approbation)
- Messages de contact (besoin de réponse)

---

## 🚀 ÉTAPES COMPLÈTES POUR TESTER

### Checklist

- [ ] 1. Créer l'index Firestore (via lien ou manuellement)
- [ ] 2. Attendre 2-5 minutes que l'index soit actif
- [ ] 3. Créer un compte admin (via /setup-admin)
- [ ] 4. Se déconnecter et se reconnecter en admin
- [ ] 5. Ouvrir la console (F12) et vérifier les logs
- [ ] 6. Créer des données de test (message + inscription)
- [ ] 7. Vérifier que la cloche 🔔 affiche un badge rouge
- [ ] 8. Cliquer sur la cloche et voir les notifications
- [ ] 9. Tester "Approuver" et "Refuser" sur les inscriptions
- [ ] 10. Tester "Marquer lu" sur les messages

---

## 📝 NOTES IMPORTANTES

### Règles Firestore
Les règles ont été mises à jour dans le code, mais elles doivent être **déployées** :

```bash
firebase deploy --only firestore:rules
```

Ou manuellement via Firebase Console → Firestore Database → Rules

### URLs Importantes
- **Application :** https://5173-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai
- **Setup Admin :** https://5173-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/setup-admin
- **Firebase Console :** https://console.firebase.google.com/project/eduinfor-fff3d

---

## ❓ PROBLÈMES COURANTS

### "L'index est en cours de création..."
→ Attendez 2-5 minutes, puis rechargez la page

### "Je ne vois toujours pas de notifications"
→ Vérifiez :
1. Êtes-vous connecté en **admin** ? (vérifiez les logs console)
2. Y a-t-il des données "pending" ? (créez-en si nécessaire)
3. Les règles Firestore sont-elles déployées ?

### "L'erreur d'index persiste"
→ J'ai ajouté un fallback dans le code qui va charger tous les cours et filtrer localement. Cela devrait fonctionner même sans l'index, mais c'est plus lent.

---

## 🎉 RÉSULTAT ATTENDU

Une fois tout configuré correctement, vous devriez voir :

1. **Dans la console :**
   ```
   ✅ Starting notification listeners for admin...
   🔔 Total notifications: X (X unread)
   ```

2. **Dans l'interface :**
   - Cloche 🔔 en haut à droite avec badge rouge
   - Clic → Panneau qui s'ouvre en position fixed
   - Notifications des inscriptions et messages
   - Boutons "Approuver/Refuser" et "Marquer lu"

3. **Aucune erreur dans la console**

✅ **TOUT FONCTIONNERA PARFAITEMENT !**
