# Teacher Statistics System - UI/UX Visual Guide

This document provides a visual description of the statistics system user interface.

---

## 📍 Entry Points - Where to Find Statistics

### 1. Course Cards (Teacher Dashboard - Courses Tab)

```
┌─────────────────────────────────────────────────────────────┐
│  [📷 Course Thumbnail Image]                                 │
├─────────────────────────────────────────────────────────────┤
│  ☐ Advanced Mathematics                        [Publié] 🟢  │
│  Complete algebra and geometry course...                    │
│                                                              │
│  [Mathematics 📘]  [⏰ 45 min]                              │
│  [👥 15 étudiants]                                          │
│                                                              │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐       │
│  │ Modifier│ Publier │   📊    │ Dupli.. │ Supp... │       │
│  │  [✏️]   │         │ ← NEW!  │  [📋]   │  [🗑️]  │       │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘       │
└─────────────────────────────────────────────────────────────┘
```

**NEW: Blue Statistics Button (📊)**
- Position: 3rd button from left
- Icon: ChartBarIcon (bar chart)
- Color: Blue (bg-blue-100)
- Tooltip: "Statistiques" (FR) / "إحصائيات" (AR)
- Action: Opens CourseStats modal

---

### 2. Quiz Cards (Teacher Dashboard - Quizzes Tab)

```
┌────────────────────────────────────────────────┐
│  Algebra Basics Quiz          [Publié] 🟢     │
│  10 questions                                  │
│                                                │
│  ┌──────────┬─────────┬──────────┐           │
│  │ Modifier │   📊    │ Supprimer│           │
│  │   [✏️]   │ ← NEW!  │   [🗑️]   │           │
│  └──────────┴─────────┴──────────┘           │
└────────────────────────────────────────────────┘
```

**NEW: Green Results Button (📊)**
- Position: Between Edit and Delete buttons
- Icon: ChartBarIcon
- Color: Green (bg-green-600)
- Tooltip: "Résultats" (FR) / "النتائج" (AR)
- Action: Opens QuizResults modal

---

### 3. Exercise Cards (Teacher Dashboard - Exercises Tab)

```
┌────────────────────────────────────────────────┐
│  Physics Problems             [Publié] 🟢     │
│  0 questions                                   │
│                                                │
│  ┌──────────┬─────────┬──────────┐           │
│  │ Modifier │   📊    │ Supprimer│           │
│  │   [✏️]   │ ← NEW!  │   [🗑️]   │           │
│  └──────────┴─────────┴──────────┘           │
└────────────────────────────────────────────────┘
```

**NEW: Green Submissions Button (📊)**
- Position: Between Edit and Delete buttons
- Icon: ChartBarIcon
- Color: Green (bg-green-600)
- Tooltip: "Soumissions" (FR) / "الإجابات" (AR)
- Action: Opens ExerciseSubmissions modal

---

## 📊 Modal 1: CourseStats Component

### Full-Screen Modal Layout

```
╔═════════════════════════════════════════════════════════════╗
║  Statistiques du cours: Advanced Mathematics          [✕]  ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  ┌─────────────────┬─────────────────┬──────────────────┐  ║
║  │  Total vues     │  Étudiants      │  Temps moyen     │  ║
║  │      25         │      15         │     35 min       │  ║
║  └─────────────────┴─────────────────┴──────────────────┘  ║
║                                                             ║
║  Historique des consultations                              ║
║  ┌──────────────────────────────────────────────────────┐  ║
║  │ Étudiant         │ Date consultée │ Durée            │  ║
║  ├──────────────────────────────────────────────────────┤  ║
║  │ Ahmed Bennani    │ 31/10/25 14:30│ 45 min 12 sec    │  ║
║  │ Fatima Zahra     │ 31/10/25 13:15│ 28 min 45 sec    │  ║
║  │ Mohammed Alami   │ 31/10/25 10:20│ 52 min 03 sec    │  ║
║  │ Sara El Idrissi  │ 30/10/25 16:45│ 33 min 20 sec    │  ║
║  │ ...              │ ...           │ ...              │  ║
║  └──────────────────────────────────────────────────────┘  ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

### Features
- **Header**: Course title with close button
- **Summary Cards**: 3 stat cards in a row
  - Blue gradient styling
  - Large numbers with labels
- **History Table**: Scrollable list of all views
  - Student name
  - Formatted date and time
  - Duration in minutes and seconds
- **Empty State**: Shows friendly message if no views yet
- **Responsive**: Stacks cards vertically on mobile

---

## 📈 Modal 2: QuizResults Component

### Part A: Summary View

```
╔═════════════════════════════════════════════════════════════╗
║  Résultats du quiz: Algebra Basics Quiz           [✕]     ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │  📊 Statistiques Générales                          │   ║
║  │  ───────────────────────────────────────────────    │   ║
║  │  Tentatives: 15  │  Score moyen: 15.5/20           │   ║
║  │  Taux de réussite: 75%  │  Questions: 10           │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
║  📈 Statistiques par Question                              ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ Q1: What is 2 + 2?                                  │   ║
║  │ [████████████████░░░░] 80%                          │   ║
║  │ ✅ 12 correctes  ❌ 3 incorrectes   🟢 Facile       │   ║
║  ├─────────────────────────────────────────────────────┤   ║
║  │ Q2: Solve x² - 4 = 0                                │   ║
║  │ [████████░░░░░░░░░░░░] 40%                          │   ║
║  │ ✅ 6 correctes  ❌ 9 incorrectes   🔴 Difficile     │   ║
║  ├─────────────────────────────────────────────────────┤   ║
║  │ Q3: What is the value of π?                         │   ║
║  │ [██████████████░░░░░░] 70%                          │   ║
║  │ ✅ 10 correctes  ❌ 5 incorrectes   🟡 Moyen        │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
║  👥 Résultats des Étudiants                                ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ Ahmed Bennani    16/20 (80%)  31/10/25  [Détails]  │   ║
║  │ Fatima Zahra     18/20 (90%)  31/10/25  [Détails]  │   ║
║  │ Mohammed Alami   12/20 (60%)  31/10/25  [Détails]  │   ║
║  │ Sara El Idrissi  14/20 (70%)  30/10/25  [Détails]  │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

### Part B: Detailed Result Modal (Nested Modal)

Clicking "Détails" button opens:

```
╔═════════════════════════════════════════════════════════════╗
║  Résultat détaillé - Ahmed Bennani                   [✕]  ║
║  Score: 16/20 (80%)  •  Soumis le: 31/10/25 à 14:30       ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ Question 1                              [QCU] 📝    │   ║
║  │ What is 2 + 2?                                      │   ║
║  │                                                     │   ║
║  │ ✅ Réponse de l'étudiant:                          │   ║
║  │ ┌─────────────────────────────────────────────┐    │   ║
║  │ │  4                                    ✓      │    │   ║
║  │ └─────────────────────────────────────────────┘    │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ Question 2                              [QCM] 📝    │   ║
║  │ Select all prime numbers:                           │   ║
║  │                                                     │   ║
║  │ ❌ Réponse de l'étudiant:                          │   ║
║  │ ┌─────────────────────────────────────────────┐    │   ║
║  │ │  • 2                                   ✗     │    │   ║
║  │ │  • 4                                         │    │   ║
║  │ └─────────────────────────────────────────────┘    │   ║
║  │                                                     │   ║
║  │ ✅ Bonne réponse:                                  │   ║
║  │ ┌─────────────────────────────────────────────┐    │   ║
║  │ │  • 2                                         │    │   ║
║  │ │  • 3                                         │    │   ║
║  │ │  • 5                                         │    │   ║
║  │ └─────────────────────────────────────────────┘    │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ Question 3                          [Vrai/Faux] 📝  │   ║
║  │ The Earth is flat.                                  │   ║
║  │                                                     │   ║
║  │ ✅ Réponse de l'étudiant:                          │   ║
║  │ ┌─────────────────────────────────────────────┐    │   ║
║  │ │  Faux                                  ✓     │    │   ║
║  │ └─────────────────────────────────────────────┘    │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ Question 4                    [Texte à Trou] 📝     │   ║
║  │ Complete: The ___ is the capital of France.         │   ║
║  │                                                     │   ║
║  │ ❌ Réponse de l'étudiant:                          │   ║
║  │ ┌─────────────────────────────────────────────┐    │   ║
║  │ │  The ___1___ is the capital of France  ✗    │    │   ║
║  │ │  ___1___: Lyon                               │    │   ║
║  │ └─────────────────────────────────────────────┘    │   ║
║  │                                                     │   ║
║  │ ✅ Bonne réponse:                                  │   ║
║  │ ┌─────────────────────────────────────────────┐    │   ║
║  │ │  The ___1___ is the capital of France       │    │   ║
║  │ │  ___1___: Paris                              │    │   ║
║  │ └─────────────────────────────────────────────┘    │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

### Visual Color Coding
- ✅ **Green backgrounds**: Correct answers
- ❌ **Red backgrounds**: Incorrect answers
- **Question Type Badges**:
  - QCU: Blue badge
  - QCM: Purple badge
  - Vrai/Faux: Green badge
  - Texte à Trou: Orange badge
- **Difficulty Indicators**:
  - 🟢 Facile (>70%)
  - 🟡 Moyen (40-70%)
  - 🔴 Difficile (<40%)

---

## 📝 Modal 3: ExerciseSubmissions Component

### Part A: Stats Dashboard

```
╔═════════════════════════════════════════════════════════════╗
║  Soumissions: Physics Problems                       [✕]  ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  ┌──────────┬──────────┬──────────┬──────────┐            ║
║  │ Total    │ Évaluées │ En attente│ Note moy │            ║
║  │  [📊]    │  [✅]    │   [⏰]    │  [📈]   │            ║
║  │   15     │    12    │     3     │  14.5/20 │            ║
║  │ 🔵 Blue  │ 🟢 Green │ 🟡 Yellow │ 🟣 Purple│            ║
║  └──────────┴──────────┴──────────┴──────────┘            ║
║                                                             ║
║  📋 Liste des Soumissions                                  ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ Ahmed Bennani                                       │   ║
║  │ Soumis le: 31/10/2025 à 14:30                      │   ║
║  │ [Évaluée ✅ 15/20]                    [Détails]    │   ║
║  ├─────────────────────────────────────────────────────┤   ║
║  │ Fatima Zahra                                        │   ║
║  │ Soumis le: 31/10/2025 à 13:15                      │   ║
║  │ [En attente ⏳]                        [Détails]    │   ║
║  ├─────────────────────────────────────────────────────┤   ║
║  │ Mohammed Alami                                      │   ║
║  │ Soumis le: 31/10/2025 à 10:20                      │   ║
║  │ [Évaluée ✅ 16.5/20]                  [Détails]    │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

### Part B: Submission Detail Modal (For Ungraded)

Clicking "Détails" for ungraded submission:

```
╔═════════════════════════════════════════════════════════════╗
║  Soumission de: Fatima Zahra                         [✕]  ║
║  Physics Problems                                          ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  📝 Réponse de l'étudiant                                  ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │                                                     │   ║
║  │  To solve this problem, we need to apply Newton's   │   ║
║  │  second law of motion: F = ma.                      │   ║
║  │                                                     │   ║
║  │  Given: F = 50N, m = 10kg                          │   ║
║  │  Therefore: a = F/m = 50/10 = 5 m/s²               │   ║
║  │                                                     │   ║
║  │  The acceleration is 5 meters per second squared.   │   ║
║  │                                                     │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
║  ✏️ Évaluation                                             ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ Note (sur 20): [15.5      ▼]                       │   ║
║  │                                                     │   ║
║  │ Commentaires:                                       │   ║
║  │ ┌─────────────────────────────────────────────┐    │   ║
║  │ │ Excellent work! You correctly applied       │    │   ║
║  │ │ Newton's second law and showed all your     │    │   ║
║  │ │ work. Minor deduction for not including     │    │   ║
║  │ │ units in the intermediate step.              │    │   ║
║  │ └─────────────────────────────────────────────┘    │   ║
║  │                                                     │   ║
║  │            [Enregistrer la Note]                    │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

### Part C: Submission Detail Modal (Already Graded)

Clicking "Détails" for graded submission:

```
╔═════════════════════════════════════════════════════════════╗
║  Soumission de: Ahmed Bennani                        [✕]  ║
║  Physics Problems                                          ║
╠═════════════════════════════════════════════════════════════╣
║                                                             ║
║  📝 Réponse de l'étudiant                                  ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │                                                     │   ║
║  │  [Student's answer text displayed here...]          │   ║
║  │                                                     │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
║  ✅ Évaluée                                                ║
║  ┌─────────────────────────────────────────────────────┐   ║
║  │ Note: 15/20                                         │   ║
║  │                                                     │   ║
║  │ Commentaires:                                       │   ║
║  │ ┌─────────────────────────────────────────────┐    │   ║
║  │ │ Good understanding of the concept. Work on  │    │   ║
║  │ │ showing more detailed steps in your         │    │   ║
║  │ │ calculations.                                │    │   ║
║  │ └─────────────────────────────────────────────┘    │   ║
║  │                                                     │   ║
║  │ Évaluée le: 31/10/2025 à 15:45                     │   ║
║  │                                                     │   ║
║  │            [Modifier l'évaluation]                  │   ║
║  └─────────────────────────────────────────────────────┘   ║
║                                                             ║
╚═════════════════════════════════════════════════════════════╝
```

### Grading Interface Features
- **Grade Input**: Number input with 0.5 step (0, 0.5, 1, 1.5, ... 20)
- **Feedback Textarea**: Multi-line text for detailed comments
- **Save Button**: Large, prominent button
- **Already Graded View**: Shows grade, feedback, and timestamp
- **Re-grade Option**: Can modify existing grades

---

## 🎨 Design System

### Color Palette

**Statistics Buttons**:
- Course Stats: Blue (`bg-blue-100`, `text-blue-600`)
- Quiz Results: Green (`bg-green-600`, `text-white`)
- Exercise Submissions: Green (`bg-green-600`, `text-white`)

**Modal Backgrounds**:
- Light mode: White (`bg-white`)
- Dark mode: Dark gray (`dark:bg-gray-800`)

**Status Badges**:
- Published: Green (`bg-green-100`, `text-green-700`)
- Draft: Gray (`bg-gray-100`, `text-gray-700`)
- Graded: Green (`bg-green-100`, `text-green-700`)
- Pending: Yellow (`bg-yellow-100`, `text-yellow-700`)

**Answer Highlighting**:
- Correct: Green (`bg-green-50`, `border-green-500`)
- Incorrect: Red (`bg-red-50`, `border-red-500`)
- Neutral: Gray (`bg-gray-50`, `border-gray-300`)

### Typography
- **Headings**: Bold, large (text-2xl, font-bold)
- **Body Text**: Regular (text-base)
- **Labels**: Medium weight (font-medium)
- **Small Text**: Small size (text-sm)

### Spacing
- **Card Padding**: p-4 or p-6
- **Gap Between Elements**: gap-2, gap-4, gap-6
- **Modal Margins**: m-4 or m-6

### Icons
- **ChartBarIcon**: Statistics buttons
- **CheckCircleIcon**: Correct answers
- **XCircleIcon**: Incorrect answers
- **ClockIcon**: Time-related info
- **UserIcon**: Student-related info
- **DocumentIcon**: Content-related info

### Responsive Breakpoints
- **Mobile**: < 768px (stack vertically)
- **Tablet**: 768px - 1024px (2-column grid)
- **Desktop**: > 1024px (3-column grid)

---

## 🌐 Internationalization (i18n)

### Language Support
- **French (FR)**: Primary language
- **Arabic (AR)**: Right-to-left (RTL) layout

### RTL Adaptations
- Text alignment: `text-right` for Arabic
- Direction: `dir="rtl"` on container elements
- Icon placement: Flipped for RTL
- Modal close button: Left side for RTL

### Date/Time Formatting
- **French**: DD/MM/YYYY HH:MM (31/10/2025 14:30)
- **Arabic**: Same format with RTL display

---

## 🌙 Dark Mode

### How It Works
- Uses Tailwind's `dark:` variants
- Automatically detects system preference
- All components support dark mode

### Dark Mode Colors
- Background: `dark:bg-gray-900`, `dark:bg-gray-800`
- Text: `dark:text-white`, `dark:text-gray-300`
- Borders: `dark:border-gray-700`
- Cards: `dark:bg-gray-800`

---

## 📱 Responsive Design

### Mobile View (< 768px)
- Statistics buttons: Full width
- Modal: Full screen
- Stats cards: Stack vertically
- Tables: Horizontal scroll

### Tablet View (768px - 1024px)
- Statistics buttons: Side by side
- Modal: 90% width, centered
- Stats cards: 2 per row
- Tables: Full width

### Desktop View (> 1024px)
- Statistics buttons: Inline with others
- Modal: 80% width, centered
- Stats cards: 3-4 per row
- Tables: Full width with proper spacing

---

## 🎯 User Flow Examples

### Example 1: Checking Course Views
1. Teacher opens Teacher Dashboard
2. Navigates to "Courses" tab
3. Sees list of courses
4. Clicks blue statistics button (📊) on "Advanced Mathematics" course
5. **CourseStats modal opens**
6. Sees:
   - 25 total views
   - 15 unique students
   - 35 min average time
7. Scrolls down to see view history
8. Sees Ahmed viewed on 31/10 at 14:30 for 45 min
9. Clicks X or backdrop to close modal

### Example 2: Analyzing Quiz Results
1. Teacher navigates to "Quizzes" tab
2. Clicks green results button (📊) on "Algebra Basics Quiz"
3. **QuizResults modal opens**
4. Sees summary:
   - 15 attempts
   - Average score: 15.5/20
   - 75% pass rate
5. Reviews per-question statistics:
   - Q2 only has 40% success rate (difficult)
   - Decides to review this question
6. Scrolls to student results list
7. Clicks "Détails" for Ahmed Bennani
8. **Detailed result modal opens**
9. Sees Ahmed got Q2 wrong (red highlighting)
10. Sees correct answer for comparison
11. Closes detailed modal
12. Closes main results modal

### Example 3: Grading Exercise Submission
1. Teacher navigates to "Exercises" tab
2. Clicks green submissions button (📊) on "Physics Problems"
3. **ExerciseSubmissions modal opens**
4. Sees stats:
   - 15 total submissions
   - 12 graded
   - 3 pending
5. Sees Fatima's submission marked "En attente" (yellow)
6. Clicks "Détails" on Fatima's submission
7. **Submission detail modal opens**
8. Reads Fatima's answer
9. Enters grade: 15.5
10. Types feedback: "Excellent work! Minor deduction for..."
11. Clicks "Enregistrer la Note"
12. **Toast notification appears**: "Réponse évaluée"
13. Modal closes automatically
14. Sees Fatima's submission now shows "Évaluée ✅ 15.5/20"

---

## ✨ Interactive Elements

### Buttons
- **Hover**: Slight color change
- **Active**: Pressed state
- **Disabled**: Grayed out, no hover
- **Focus**: Ring outline for accessibility

### Modals
- **Open**: Fade in animation
- **Close**: Fade out animation
- **Backdrop**: Click to close
- **X Button**: Top-right corner
- **Scroll**: Enabled for long content

### Tables
- **Hover**: Row highlighting
- **Alternating Rows**: Subtle background difference
- **Responsive**: Horizontal scroll on mobile

### Forms
- **Input Focus**: Border highlight
- **Validation**: Red border for errors
- **Success**: Green checkmark
- **Loading**: Disabled with loading indicator

---

## 🎬 Animation & Transitions

### Modal Transitions
```css
/* Opening */
opacity: 0 → 1 (300ms ease)
scale: 0.95 → 1 (300ms ease)

/* Closing */
opacity: 1 → 0 (200ms ease)
scale: 1 → 0.95 (200ms ease)
```

### Button Transitions
```css
/* Hover */
background-color: transition 150ms ease
transform: translateY(-1px) (subtle lift)

/* Active */
transform: translateY(0px)
```

### Loading States
```css
/* Spinner */
rotation: 0deg → 360deg (1s infinite)
```

---

**This guide provides a comprehensive visual reference for the Teacher Statistics System UI/UX.**

For implementation details, refer to:
- `STATISTICS_SYSTEM_COMPLETE.md`
- Component source files in `src/components/`
