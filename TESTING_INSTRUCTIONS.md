# Testing Instructions: Class Selection in Signup Form

## 🎯 Goal
Test if classes added by admin appear in the student signup form

## 📋 Prerequisites
1. ✅ Development server running at: https://5175-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai
2. ✅ Admin account exists:
   - Email: `superadmin@eduplatform.ma`
   - Password: `SuperAdmin@2025!Secure`

## 🧪 Test Procedure

### Step 1: Login as Admin
1. Go to: https://5175-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/login
2. Login with admin credentials:
   - Email: `superadmin@eduplatform.ma`
   - Password: `SuperAdmin@2025!Secure`

### Step 2: Access Academic Structure Management
1. After login, you should be redirected to Admin Dashboard
2. Click on "Structure Académique" or "Academic Structure" tab in the admin panel
3. You should see a unified interface for managing:
   - **Niveaux** (Levels): TC, 1BAC, 2BAC
   - **Types/Filières** (Branches): SC (Sciences), MATH (Mathématiques), etc.
   - **Classes**: Individual classes within each Level + Branch
   - **Matières** (Subjects): Physics, Mathematics, etc.

### Step 3: Add Test Classes

#### For 2BAC Sciences:
1. Select tab "Classes"
2. Click "Ajouter une Classe" / "Add Class"
3. Fill in the form:
   - **Level**: Select "2ème Baccalauréat" (2BAC)
   - **Branch**: Select "Sciences" (SC)
   - **Code**: `2BAC-SC-1`
   - **Name (French)**: `2ème Bac Sciences - Classe 1`
   - **Name (Arabic)**: `الثانية باكالوريا علوم - القسم 1`
   - **Order**: `1`
   - **Enabled**: ✅ Checked
4. Click "Save" / "Enregistrer"
5. Repeat for Class 2:
   - Code: `2BAC-SC-2`
   - Name (French): `2ème Bac Sciences - Classe 2`
   - Name (Arabic): `الثانية باكالوريا علوم - القسم 2`
   - Order: `2`

#### For 1BAC Mathématiques:
1. Add two classes:
   - Code: `1BAC-MATH-1`, Name: `1ère Bac Mathématiques - Classe 1`
   - Code: `1BAC-MATH-2`, Name: `1ère Bac Mathématiques - Classe 2`

#### For TC Sciences:
1. Add two classes:
   - Code: `TC-SC-1`, Name: `Tronc Commun Sciences - Classe 1`
   - Code: `TC-SC-2`, Name: `Tronc Commun Sciences - Classe 2`

### Step 4: Test Signup Form
1. **Logout** from admin account
2. Go to signup page: https://5175-irq1kz7b7dbqgugy7j37h-b32ec7bb.sandbox.novita.ai/signup
3. Fill in student information:
   - Full Name: `Test Student`
   - Email: `teststudent@example.com`
   - Password: `TestPassword123`
   - Confirm Password: `TestPassword123`
   - Role: `Student` (should be pre-selected)

4. **Test Hierarchical Selection**:
   
   **Test Case 1: 2BAC Sciences**
   - Select **Level**: "2ème Baccalauréat"
   - ✅ **Verify**: Branch dropdown appears and is enabled
   - Select **Branch**: "Sciences"
   - ✅ **Verify**: Class dropdown appears with loading indicator
   - ✅ **Verify**: Class dropdown shows:
     - "2ème Bac Sciences - Classe 1"
     - "2ème Bac Sciences - Classe 2"
   - Select **Class**: "2ème Bac Sciences - Classe 1"
   
   **Test Case 2: 1BAC Mathématiques**
   - Change **Level**: "1ère Baccalauréat"
   - ✅ **Verify**: Branch dropdown resets and shows branches for 1BAC
   - Select **Branch**: "Mathématiques"
   - ✅ **Verify**: Class dropdown shows:
     - "1ère Bac Mathématiques - Classe 1"
     - "1ère Bac Mathématiques - Classe 2"

5. Complete signup with valid class selection
6. Check browser console for any errors

### Step 5: Verify User Profile
1. After signup, you should see "Pending Approval" page (if student approval is enabled)
2. **Login as Admin** again
3. Go to **Users Management** section
4. Find the test student you just created
5. ✅ **Verify** the user profile contains:
   - `class`: "2BAC-SC-1" (or whatever you selected)
   - `classNameFr`: "2ème Bac Sciences - Classe 1"
   - `classNameAr`: "الثانية باكالوريا علوم - القسم 1"
   - `levelCode`: "2BAC"
   - `branchCode`: "SC"

### Step 6: Test Course Filtering (After Approval)
1. As admin, **approve** the test student
2. Login as the test student
3. Navigate to Student Dashboard
4. ✅ **Verify**:
   - Welcome message shows class information
   - Class badge displays: "2ème Bac Sciences - Classe 1"
   - Only courses targeted to class "2BAC-SC-1" appear in the course list

## 📊 Expected Results

### ✅ Success Criteria:
1. Admin can create classes via Academic Structure Management interface
2. Classes appear in signup form when Level + Branch are selected
3. Cascade selection works: Level → Branch → Class
4. User profile is enriched with complete class information
5. Student dashboard filters courses by specific class
6. Class badge displays correctly on student dashboard

### ❌ Potential Issues:
1. **Classes not appearing**: Check Firestore console - classes collection must have:
   - `enabled: true`
   - Correct `levelCode` and `branchCode`
2. **Permission denied**: Ensure admin user has `role: 'admin'` in Firestore users collection
3. **Firestore index required**: Check Firebase console for index creation prompts
4. **Cascade not working**: Check browser console for JavaScript errors

## 🛠️ Troubleshooting

### If classes don't appear in signup:
```javascript
// Open browser console on signup page and run:
import { getFirestore, collection, getDocs } from 'firebase/firestore';
const db = getFirestore();
const snapshot = await getDocs(collection(db, 'classes'));
console.log('Total classes:', snapshot.size);
snapshot.forEach(doc => console.log(doc.id, doc.data()));
```

### Check Firestore Rules:
- Ensure `classes` collection has:
  ```javascript
  match /classes/{classId} {
    allow read: if true;  // Public read
    allow create, update, delete: if isAdmin();
  }
  ```

### Check Required Firestore Index:
- Collection: `classes`
- Fields indexed:
  - `levelCode` (Ascending)
  - `branchCode` (Ascending)
  - `enabled` (Ascending)
  - `order` (Ascending)

## 📝 Test Data Summary

| Level Code | Branch Code | Class Code    | Name (French)                  |
|------------|-------------|---------------|--------------------------------|
| 2BAC       | SC          | 2BAC-SC-1     | 2ème Bac Sciences - Classe 1   |
| 2BAC       | SC          | 2BAC-SC-2     | 2ème Bac Sciences - Classe 2   |
| 2BAC       | MATH        | 2BAC-MATH-1   | 2ème Bac Mathématiques - Classe 1 |
| 2BAC       | MATH        | 2BAC-MATH-2   | 2ème Bac Mathématiques - Classe 2 |
| 1BAC       | SC          | 1BAC-SC-1     | 1ère Bac Sciences - Classe 1   |
| 1BAC       | SC          | 1BAC-SC-2     | 1ère Bac Sciences - Classe 2   |
| 1BAC       | MATH        | 1BAC-MATH-1   | 1ère Bac Mathématiques - Classe 1 |
| 1BAC       | MATH        | 1BAC-MATH-2   | 1ère Bac Mathématiques - Classe 2 |
| TC         | SC          | TC-SC-1       | Tronc Commun Sciences - Classe 1 |
| TC         | SC          | TC-SC-2       | Tronc Commun Sciences - Classe 2 |

## 🎓 Next Steps After Successful Test
1. Add more test classes for different branches (Lettres, Économie, etc.)
2. Create test courses with `targetClasses` field
3. Verify course filtering works correctly for each class
4. Test with multiple students from different classes
5. Verify that students only see courses for their specific class
