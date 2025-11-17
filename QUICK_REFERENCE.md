# 🚀 Aide-Mémoire Rapide - Info_Plat

## ⚠️ RÈGLE #1 - NE JAMAIS OUBLIER

```
┌──────────────────────────────────────────┐
│                                          │
│  Branche de développement :              │
│                                          │
│       genspark_ai_developer              │
│                                          │
│  TOUJOURS TRAVAILLER SUR CETTE BRANCHE ! │
│                                          │
└──────────────────────────────────────────┘
```

---

## 🔥 Commandes Essentielles

### Avant de Commencer à Coder
```bash
# 1. Vérifier la branche
git branch

# 2. Basculer si nécessaire
git checkout genspark_ai_developer

# 3. Synchroniser
git pull origin genspark_ai_developer
```

### Après Avoir Codé
```bash
# 1. Ajouter les modifications
git add .

# 2. Commiter
git commit -m "feat: description"

# 3. Pousser
git push origin genspark_ai_developer
```

### Pour Déployer en Production
```bash
# Créer une PR sur GitHub
# De : genspark_ai_developer
# Vers : main
```

---

## 📚 Documentation Disponible

| Fichier | Description |
|---------|-------------|
| **README_IMPORTANT.md** | ⚠️ À lire en premier - Stratégie branches |
| **BRANCH_STRATEGY.md** | Guide détaillé Git workflow |
| **TEACHER_DASHBOARD_FEATURES.md** | Liste complète fonctionnalités Teacher |
| **TEACHER_DASHBOARD_SUMMARY.md** | Guide et tests Teacher Dashboard |
| **PROJECT_COMPLETION_SUMMARY.md** | Vue d'ensemble du projet |
| **STATUS_VERIFICATION_25_OCT_2025.md** | Rapport de vérification complet |

---

## ✅ Fonctionnalités Teacher Dashboard

### Recherche et Filtrage ✅
- Barre de recherche bilingue
- Filtre par catégorie (10 options)
- Filtre par statut (Publié/Brouillon)

### Sélection Multiple ✅
- Checkbox sur chaque cours
- "Sélectionner tout"
- Compteur de sélection

### Actions en Masse ✅
- Publier plusieurs cours
- Dépublier plusieurs cours
- Supprimer plusieurs cours

### Duplication ✅
- Copier un cours en un clic
- Titre avec "(Copie)"
- Statut "Brouillon" par défaut

---

## 🎯 Workflow Visuel

```
[Développement]
      ↓
genspark_ai_developer
      ↓
   Commiter
      ↓
   Pousser
      ↓
 Créer PR
      ↓
    main
      ↓
[Production Vercel]
```

---

## 🔗 Liens Rapides

- **GitHub Repo** : https://github.com/mamounbq1/Info_Plat.git
- **Branche Dev** : `genspark_ai_developer`
- **Branche Prod** : `main`

---

## ⚡ En Cas d'Urgence

Si vous n'êtes pas sûr de la branche :

```bash
# Vérifier
git status

# Si sur main, BASCULER !
git checkout genspark_ai_developer
```

---

**Dernière mise à jour** : 25 octobre 2025  
**Branche de référence** : `genspark_ai_developer`
