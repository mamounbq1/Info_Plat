# 🔥 Firebase Configuration Update Guide

## 📋 Overview

This guide explains the Firebase Firestore rules and indexes updates required for the new academic structure management system.

## 🆕 New Collections Added

### 1. **branches** (Types/Filières)
- **Purpose**: Store academic branches like Sciences, Lettres
- **Access**: Public read, Admin-only write
- **Fields**: `nameFr`, `nameAr`, `code`, `levelCode`, `description`, `order`, `enabled`

### 2. **classes** (Classes)
- **Purpose**: Store real lycée classes like TCSF1-6, TCLSH1-2
- **Access**: Public read, Admin-only write
- **Fields**: `nameFr`, `nameAr`, `code`, `levelCode`, `branchCode`, `capacity`, `order`, `enabled`

### 3. **subjects** (Matières - INDEPENDENT)
- **Purpose**: Store universal subjects like Math, Physics, French
- **Access**: Public read, Admin-only write
- **Fields**: `nameFr`, `nameAr`, `code`, `description`, `order`, `enabled`
- **Note**: ⚠️ Subjects are COMPLETELY INDEPENDENT - not linked to levels, branches, or classes

## 🔐 Firestore Security Rules Updates

### Added Rules (lines 141-158 in firestore.rules)

```javascript
// Branches (Types/Filières) collection
match /branches/{branchId} {
  allow read: if true; // Public read access
  allow create, update, delete: if isAdmin();
}

// Classes collection
match /classes/{classId} {
  allow read: if true; // Public read access
  allow create, update, delete: if isAdmin();
}

// Subjects (Matières) collection - INDEPENDENT
match /subjects/{subjectId} {
  allow read: if true; // Public read access
  allow create, update, delete: if isAdmin();
}
```

### Why Public Read Access?
- **branches**: Needed for signup forms, student profiles, course filtering
- **classes**: Needed for student profiles, schedules, attendance
- **subjects**: Needed for course creation, teacher profiles, student schedules

## 📊 Firestore Composite Indexes Added

### 1. **academicLevels** Indexes
```json
{
  "collectionGroup": "academicLevels",
  "fields": [
    { "fieldPath": "enabled", "order": "ASCENDING" },
    { "fieldPath": "order", "order": "ASCENDING" }
  ]
}
```

### 2. **branches** Indexes
```json
// Index 1: Filter by enabled + sort by order
{
  "collectionGroup": "branches",
  "fields": [
    { "fieldPath": "enabled", "order": "ASCENDING" },
    { "fieldPath": "order", "order": "ASCENDING" }
  ]
}

// Index 2: Filter by level + sort by order
{
  "collectionGroup": "branches",
  "fields": [
    { "fieldPath": "levelCode", "order": "ASCENDING" },
    { "fieldPath": "order", "order": "ASCENDING" }
  ]
}
```

### 3. **classes** Indexes
```json
// Index 1: Filter by enabled + sort by order
{
  "collectionGroup": "classes",
  "fields": [
    { "fieldPath": "enabled", "order": "ASCENDING" },
    { "fieldPath": "order", "order": "ASCENDING" }
  ]
}

// Index 2: Filter by level + branch + sort by order
{
  "collectionGroup": "classes",
  "fields": [
    { "fieldPath": "levelCode", "order": "ASCENDING" },
    { "fieldPath": "branchCode", "order": "ASCENDING" },
    { "fieldPath": "order", "order": "ASCENDING" }
  ]
}
```

### 4. **subjects** Indexes
```json
{
  "collectionGroup": "subjects",
  "fields": [
    { "fieldPath": "enabled", "order": "ASCENDING" },
    { "fieldPath": "order", "order": "ASCENDING" }
  ]
}
```

## 🚀 Deployment Steps

### Option 1: Using Firebase CLI (Recommended)

```bash
# 1. Login to Firebase (if not already)
firebase login

# 2. Select your project
firebase use <your-project-id>

# 3. Deploy Firestore rules
firebase deploy --only firestore:rules

# 4. Deploy Firestore indexes
firebase deploy --only firestore:indexes

# 5. Deploy everything at once (alternative)
firebase deploy --only firestore
```

### Option 2: Manual Deployment via Firebase Console

#### Deploy Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy content from `firestore.rules`
5. Paste and click **Publish**

#### Deploy Indexes:
1. In Firebase Console, go to **Firestore Database** → **Indexes**
2. Click **Add Index** for each new index
3. Configure fields and order as specified above
4. Wait for index creation (can take a few minutes)

## ⚠️ Important Notes

### Index Creation Time
- Simple indexes: ~1-2 minutes
- Complex composite indexes: ~5-10 minutes
- Large collections: Can take longer

### Index Status
Check index creation status in Firebase Console:
- **Building**: Index is being created (yellow)
- **Enabled**: Index is ready to use (green)
- **Error**: Something went wrong (red)

### Query Requirements
The following queries in `AcademicStructureManagement.jsx` require these indexes:

```javascript
// Requires: academicLevels (enabled, order) index
query(collection(db, 'academicLevels'), 
  where('enabled', '==', true), 
  orderBy('order'))

// Requires: branches (enabled, order) index
query(collection(db, 'branches'), 
  where('enabled', '==', true), 
  orderBy('order'))

// Requires: branches (levelCode, order) index
query(collection(db, 'branches'), 
  where('levelCode', '==', levelCode), 
  orderBy('order'))

// Requires: classes (enabled, order) index
query(collection(db, 'classes'), 
  where('enabled', '==', true), 
  orderBy('order'))

// Requires: classes (levelCode, branchCode, order) index
query(collection(db, 'classes'), 
  where('levelCode', '==', levelCode),
  where('branchCode', '==', branchCode),
  orderBy('order'))

// Requires: subjects (enabled, order) index
query(collection(db, 'subjects'), 
  where('enabled', '==', true), 
  orderBy('order'))
```

## ✅ Verification

After deployment, verify everything works:

```bash
# 1. Start development server
npm run dev

# 2. Login as admin
# 3. Navigate to "Structure Académique" tab
# 4. Test CRUD operations for:
#    - Niveaux (Levels)
#    - Types/Filières (Branches)
#    - Classes
#    - Matières (Subjects)

# 5. Check browser console for errors
# 6. Verify Firestore queries execute successfully
```

## 🐛 Troubleshooting

### Error: "The query requires an index"
**Solution**: Wait for index creation to complete or create index manually in Firebase Console

### Error: "Missing or insufficient permissions"
**Solution**: Verify Firestore rules are deployed correctly

### Error: "Document does not exist"
**Solution**: Ensure collections are seeded with initial data

## 📚 Related Files

- **Rules**: `/firestore.rules`
- **Indexes**: `/firestore.indexes.json`
- **Component**: `/src/components/AcademicStructureManagement.jsx`
- **Dashboard**: `/src/pages/AdminDashboard.jsx`

## 🔄 Update History

- **2025-10-22**: Initial Firebase configuration for 4-level academic structure
  - Added `branches`, `classes`, `subjects` collections
  - Added 7 composite indexes
  - Made subjects completely independent from levels/branches

---

**Need Help?** Check the [Firebase Documentation](https://firebase.google.com/docs/firestore) or contact the development team.
