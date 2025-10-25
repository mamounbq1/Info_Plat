# 🧪 Testing Guide: Quiz and Exercise Complete Flow

## 📋 Overview
This guide will walk you through testing the complete quiz and exercise functionality from teacher creation to student interaction.

## 🎯 What Was Fixed
1. ✅ Added Firestore indexes for quizzes and exercises
2. ✅ Added `published` filter to exercises query in student dashboard
3. ✅ Added `published` toggle in teacher dashboard for quizzes and exercises
4. ✅ Created test data page to easily add sample courses with quizzes and exercises

---

## 🚀 Step-by-Step Testing Instructions

### **Step 1: Add Test Data**

1. **Login to your application** with any user account (student or teacher)
2. **Navigate to**: `http://localhost:5173/add-test-data` (or your deployed URL)
3. **Click**: "🚀 Créer les Données" / "🚀 إنشاء البيانات"
4. **Wait**: Should complete in ~2-5 seconds
5. **Verify Success**: You should see a green success box showing:
   - 📚 2 Courses created
   - 📝 2 Quizzes created (4 questions each)
   - 📋 4 Exercises created (2 per course)

**Test Data Created:**
- **Course 1**: Mathématiques - Algèbre
  - Quiz: Équations du premier degré (4 questions: QCU, QCM, fill-blank)
  - Exercise 1: PDF file type
  - Exercise 2: YouTube video link

- **Course 2**: Physique - Mécanique
  - Quiz: Forces et Mouvement (4 questions: QCU, QCM, fill-blank)
  - Exercise 1: PDF file type
  - Exercise 2: Interactive simulation link

---

### **Step 2: Test Teacher Dashboard** (If you're a teacher)

1. **Navigate to**: `/dashboard` (will redirect to TeacherDashboard)

2. **Verify Courses Tab**:
   - ✅ You should see the 2 courses you just created
   - ✅ Both should be marked as "Publié" (Published)

3. **Switch to Quizzes Tab** (if available in your dashboard)

4. **Edit a Quiz**:
   - Click "Edit" on one of the quizzes
   - Verify questions are displayed correctly
   - Check the **"Publier le quiz"** toggle at the bottom
   - It should be checked ✅ (published)
   - Try unchecking it → Save → Quiz becomes invisible to students
   - Check it again → Save → Quiz becomes visible again

5. **Switch to Exercises Tab** (if available)

6. **Edit an Exercise**:
   - Click "Edit" on one of the exercises
   - Verify the content (file URL or external link)
   - Check the **"Publier l'exercice"** toggle at the bottom
   - It should be checked ✅ (published)
   - Test unpublishing/publishing like you did with quiz

---

### **Step 3: Test Student Dashboard**

1. **Logout** from teacher account (if applicable)
2. **Login** as a student account
3. **Navigate to**: `/dashboard` (will redirect to EnhancedStudentDashboard)

#### **Test Quiz Visibility:**

4. **Scroll to "Quiz Disponibles" / "الاختبارات المتاحة" section**
   - ✅ You should see 2 quiz cards
   - ✅ "Quiz Algèbre - Équations du premier degré"
   - ✅ "Quiz Mécanique - Forces et Mouvement"
   - Each card shows:
     - Number of questions (4)
     - Time limit (15 min / 12 min)
     - Status badge: "Nouveau" (New)
     - "Commencer" button

5. **Click on a quiz card** → Should navigate to `/quiz/{id}`

#### **Test Taking a Quiz:**

6. **Quiz Taking Page** (`/quiz/{id}`):
   - ✅ Timer should start counting down
   - ✅ Question 1/4 displayed
   - ✅ Options are clickable
   - ✅ Progress bar shows 25%
   - Click an answer → Should be selected
   - Click "Suivant" → Next question appears
   - Navigate through all 4 questions
   - Click "Terminer" → Submit confirmation modal
   - Confirm → Navigate to results page

7. **Quiz Results Page** (`/quiz-results/{id}/{attemptIndex}`):
   - ✅ Shows your score (e.g., "15/25 points = 60%")
   - ✅ Shows Pass/Fail status
   - ✅ Lists all questions with your answers
   - ✅ Shows correct answers
   - ✅ Option to retake quiz

8. **Return to Dashboard**:
   - Quiz card should now show:
     - Status changed from "Nouveau" to "À refaire" or "Réussi" (depending on score)
     - Best score displayed
     - Number of attempts
     - "Refaire" button instead of "Commencer"

#### **Test Exercise Visibility:**

9. **Scroll to "Exercices Disponibles" / "التمارين المتاحة" section**
   - ✅ You should see 4 exercise cards
   - ✅ 2 for Mathématiques
   - ✅ 2 for Physique
   - Each shows:
     - Type badge (Fichier / Lien)
     - Difficulty level
     - Action button (Télécharger / Ouvrir)

10. **Test File Exercise**:
    - Click "Télécharger" button
    - Should attempt to open/download the file URL

11. **Test Link Exercise**:
    - Click "Ouvrir" or "Ouvrir le lien" button
    - Should open external link in new tab
    - For simulation: Should open PhET simulation

---

### **Step 4: Test Published Toggle Effects**

**As Teacher:**

1. **Go to teacher dashboard**
2. **Edit a quiz** → Uncheck "Publier le quiz" → Save
3. **Switch to student account**
4. **Refresh dashboard** → Quiz should disappear from "Quiz Disponibles"
5. **Switch back to teacher** → Re-publish the quiz
6. **Switch to student** → Quiz should reappear

**Repeat for exercises:**
7. **Unpublish an exercise** as teacher
8. **Verify** it disappears for students
9. **Re-publish** it
10. **Verify** it reappears

---

### **Step 5: Test Question Types**

The quizzes include different question types. Make sure to test:

1. **QCU (Single Choice)**: 
   - Question: "Quelle est la solution de l'équation: 2x + 5 = 13?"
   - Only one answer can be selected
   - Correct answer: x = 4

2. **QCM (Multiple Choice)**:
   - Question: "Quelles sont les propriétés de l'addition?"
   - Multiple answers can be selected
   - Correct answers: Commutativité, Associativité, Élément neutre

3. **Fill-in-the-Blank**:
   - Question: "L'équation ax + b = 0 a pour solution x = _____"
   - Type or select from word suggestions
   - Correct answer: -b/a

---

## ✅ Success Checklist

Use this checklist to ensure everything is working:

### **Data Creation:**
- [ ] Test data page loads successfully
- [ ] All 2 courses created
- [ ] All 2 quizzes created with 4 questions each
- [ ] All 4 exercises created
- [ ] Success summary displays correctly

### **Teacher Dashboard:**
- [ ] Courses visible in courses tab
- [ ] Quizzes visible (if separate tab exists)
- [ ] Exercises visible (if separate tab exists)
- [ ] Published toggle exists in quiz modal
- [ ] Published toggle exists in exercise modal
- [ ] Toggling published status works

### **Student Dashboard:**
- [ ] Published quizzes visible in "Quiz Disponibles"
- [ ] Unpublished quizzes NOT visible
- [ ] Published exercises visible in "Exercices Disponibles"
- [ ] Unpublished exercises NOT visible
- [ ] Quiz cards show correct information
- [ ] Exercise cards show correct information

### **Quiz Taking:**
- [ ] Quiz page loads with timer
- [ ] Questions display correctly
- [ ] Can select answers for QCU/QCM
- [ ] Can type/select for fill-in-blank
- [ ] Can navigate between questions
- [ ] Can submit quiz
- [ ] Results page shows score and answers
- [ ] Can retake quiz
- [ ] Quiz status updates in dashboard

### **Exercises:**
- [ ] File exercises have download button
- [ ] Link exercises have open button
- [ ] Buttons work correctly
- [ ] External links open in new tab

---

## 🐛 Known Issues / Limitations

1. **File URLs are placeholders**: The PDF files use example.com URLs. Replace with actual file URLs if needed.
2. **Video URLs**: Some YouTube URLs are placeholder links. Replace with actual educational videos.
3. **No authentication for external resources**: External links open without authentication.

---

## 🔧 Troubleshooting

### Problem: "Quiz Disponibles" section is empty
**Solution**: 
- Check if quizzes are published (teacher dashboard)
- Check Firestore indexes are deployed
- Check browser console for errors

### Problem: Exercises don't appear
**Solution**:
- Verify exercises are published
- Check if exercises index exists in Firestore
- Clear browser cache and reload

### Problem: Quiz submission fails
**Solution**:
- Check browser console for errors
- Verify Firestore security rules allow writes to quizResults
- Check user authentication status

### Problem: Timer doesn't work
**Solution**:
- Check if `timeLimit` field exists in quiz document
- Verify JavaScript is enabled
- Check for console errors

---

## 📊 Expected Results Summary

**After completing all tests, you should have:**

1. ✅ 2 Courses created and visible
2. ✅ 2 Quizzes created and functional
3. ✅ 4 Exercises created and accessible
4. ✅ Students can see only published items
5. ✅ Students can take quizzes and see results
6. ✅ Students can access exercises (download/open links)
7. ✅ Teachers can control visibility with published toggle
8. ✅ Quiz results are saved and displayed correctly
9. ✅ Quiz retake functionality works
10. ✅ All question types (QCU, QCM, fill-blank) work correctly

---

## 🎉 Congratulations!

If all tests pass, your quiz and exercise system is fully functional! 🚀

**Next Steps:**
- Replace placeholder URLs with actual educational content
- Add more courses, quizzes, and exercises
- Customize question types and difficulty levels
- Add analytics and reporting features
- Implement quiz time extensions or hints
- Add exercise submission and grading features

---

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for errors
2. Verify Firestore indexes are deployed
3. Check Firestore security rules
4. Ensure Firebase configuration is correct
5. Check that all components are properly imported

**Happy Testing! 🎓**
