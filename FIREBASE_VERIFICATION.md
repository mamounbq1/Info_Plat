# 🔍 Firebase Configuration Verification Checklist

## ✅ Pre-Deployment Checklist

Before deploying to Firebase, verify:

- [ ] Firebase CLI installed (`npm install -g firebase-tools`)
- [ ] Logged in to Firebase (`firebase login`)
- [ ] Correct project selected (`firebase use <project-id>`)
- [ ] `firestore.rules` file is up-to-date
- [ ] `firestore.indexes.json` file is up-to-date

## 🚀 Deployment Commands

```bash
# Option 1: Use automated script (recommended)
./deploy-firebase.sh

# Option 2: Manual deployment
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# Option 3: Deploy everything
firebase deploy --only firestore
```

## 📊 Required Indexes Verification

After deployment, verify these indexes are created in Firebase Console:

### 1. **academicLevels** Collection
| Index Name | Fields | Status |
|------------|--------|--------|
| enabled_order | `enabled` (ASC), `order` (ASC) | ⏳ Check |

**Query Supported**:
```javascript
query(collection(db, 'academicLevels'), 
  where('enabled', '==', true), 
  orderBy('order'))
```

### 2. **branches** Collection
| Index Name | Fields | Status |
|------------|--------|--------|
| enabled_order | `enabled` (ASC), `order` (ASC) | ⏳ Check |
| levelCode_order | `levelCode` (ASC), `order` (ASC) | ⏳ Check |

**Queries Supported**:
```javascript
// Query 1
query(collection(db, 'branches'), 
  where('enabled', '==', true), 
  orderBy('order'))

// Query 2
query(collection(db, 'branches'), 
  where('levelCode', '==', 'TC'), 
  orderBy('order'))
```

### 3. **classes** Collection
| Index Name | Fields | Status |
|------------|--------|--------|
| enabled_order | `enabled` (ASC), `order` (ASC) | ⏳ Check |
| levelCode_branchCode_order | `levelCode` (ASC), `branchCode` (ASC), `order` (ASC) | ⏳ Check |

**Queries Supported**:
```javascript
// Query 1
query(collection(db, 'classes'), 
  where('enabled', '==', true), 
  orderBy('order'))

// Query 2
query(collection(db, 'classes'), 
  where('levelCode', '==', 'TC'),
  where('branchCode', '==', 'SCI'),
  orderBy('order'))
```

### 4. **subjects** Collection
| Index Name | Fields | Status |
|------------|--------|--------|
| enabled_order | `enabled` (ASC), `order` (ASC) | ⏳ Check |

**Query Supported**:
```javascript
query(collection(db, 'subjects'), 
  where('enabled', '==', true), 
  orderBy('order'))
```

## 🔐 Security Rules Verification

After deployment, verify these rules in Firebase Console → Firestore → Rules:

### 1. **academicLevels** Rules
```javascript
match /academicLevels/{levelId} {
  allow read: if true;
  allow create, update, delete: if isAdmin();
}
```

### 2. **branches** Rules
```javascript
match /branches/{branchId} {
  allow read: if true;
  allow create, update, delete: if isAdmin();
}
```

### 3. **classes** Rules
```javascript
match /classes/{classId} {
  allow read: if true;
  allow create, update, delete: if isAdmin();
}
```

### 4. **subjects** Rules
```javascript
match /subjects/{subjectId} {
  allow read: if true;
  allow create, update, delete: if isAdmin();
}
```

## 🧪 Testing Steps

### 1. Test Public Read Access (Unauthenticated)

Open browser console on public page:
```javascript
// Should work without authentication
const levelsRef = collection(db, 'academicLevels');
const snapshot = await getDocs(levelsRef);
console.log('Levels count:', snapshot.size);
// Expected: Should return data (no permission error)
```

### 2. Test Admin Write Access

Login as admin, then in browser console:
```javascript
// Should work for admin users
await addDoc(collection(db, 'subjects'), {
  nameFr: 'Test Subject',
  nameAr: 'مادة تجريبية',
  code: 'TEST',
  enabled: true,
  order: 999,
  createdAt: new Date().toISOString()
});
// Expected: Document created successfully

// Clean up
const testDoc = await getDocs(query(
  collection(db, 'subjects'), 
  where('code', '==', 'TEST')
));
await deleteDoc(doc(db, 'subjects', testDoc.docs[0].id));
```

### 3. Test Non-Admin Write Restriction

Login as teacher or student, then in browser console:
```javascript
// Should FAIL for non-admin users
try {
  await addDoc(collection(db, 'subjects'), {
    nameFr: 'Unauthorized',
    nameAr: 'غير مصرح',
    code: 'UNAUTH',
    enabled: true,
    order: 999
  });
  console.error('❌ Security error: non-admin could write!');
} catch (error) {
  console.log('✅ Correctly blocked:', error.code);
  // Expected: permission-denied error
}
```

### 4. Test Composite Index Queries

In admin dashboard, test each collection:
```javascript
// Test academicLevels
const levels = await getDocs(query(
  collection(db, 'academicLevels'),
  where('enabled', '==', true),
  orderBy('order')
));
console.log('✅ Levels query works:', levels.size);

// Test branches
const branches = await getDocs(query(
  collection(db, 'branches'),
  where('enabled', '==', true),
  orderBy('order')
));
console.log('✅ Branches query works:', branches.size);

// Test classes
const classes = await getDocs(query(
  collection(db, 'classes'),
  where('enabled', '==', true),
  orderBy('order')
));
console.log('✅ Classes query works:', classes.size);

// Test subjects
const subjects = await getDocs(query(
  collection(db, 'subjects'),
  where('enabled', '==', true),
  orderBy('order')
));
console.log('✅ Subjects query works:', subjects.size);
```

## ⚠️ Common Issues & Solutions

### Issue 1: "The query requires an index"
**Cause**: Index not yet created or still building  
**Solution**: 
1. Check Firebase Console → Firestore → Indexes
2. Look for "Building" status (yellow indicator)
3. Wait for "Enabled" status (green indicator)
4. Can take 1-10 minutes depending on collection size

### Issue 2: "Missing or insufficient permissions"
**Cause**: Firestore rules not deployed or incorrect  
**Solution**:
1. Re-deploy rules: `firebase deploy --only firestore:rules`
2. Verify in Firebase Console → Firestore → Rules
3. Check user's role in `users` collection

### Issue 3: "Document does not exist" when checking isAdmin()
**Cause**: User document not created in Firestore `users` collection  
**Solution**:
1. Create user document in `users` collection
2. Ensure `role` field is set to `'admin'`
3. Match document ID with Firebase Auth UID

### Issue 4: Index creation failed
**Cause**: Invalid field paths or conflicting indexes  
**Solution**:
1. Check `firestore.indexes.json` syntax
2. Delete conflicting indexes in Firebase Console
3. Re-deploy: `firebase deploy --only firestore:indexes`

## 📈 Index Build Time Estimates

| Collection | Documents | Index Complexity | Est. Time |
|------------|-----------|------------------|-----------|
| academicLevels | < 10 | Simple | ~30 sec |
| branches | < 20 | Simple | ~30 sec |
| classes | < 100 | Medium | 1-2 min |
| subjects | < 50 | Simple | ~30 sec |

## 🎯 Success Criteria

All checks must pass:

- [ ] All 7 indexes created and enabled (green status)
- [ ] All 4 security rules deployed and active
- [ ] Public read access works (unauthenticated)
- [ ] Admin write access works (authenticated admin)
- [ ] Non-admin write blocked (authenticated non-admin)
- [ ] All composite queries execute without errors
- [ ] Admin dashboard loads without console errors
- [ ] CRUD operations work for all 4 collections

## 📚 Additional Resources

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore Indexes Documentation](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

**Last Updated**: 2025-10-22  
**Related Files**: `firestore.rules`, `firestore.indexes.json`, `FIREBASE_DEPLOYMENT.md`
