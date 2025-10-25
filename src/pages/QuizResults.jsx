import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * QuizResults Page
 * Displays detailed quiz results with questions, answers, and performance history
 * Features:
 * - Question-by-question breakdown with correct/incorrect indicators
 * - User's answers vs correct answers comparison
 * - Explanations for each question
 * - Performance history graph showing score progression
 * - Export results as text summary
 * - Mobile-friendly responsive design
 */
export default function QuizResults() {
  const { quizId, attemptIndex } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { isArabic } = useLanguage();
  
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [allAttempts, setAllAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    fetchQuizResults();
  }, [quizId, attemptIndex]);

  const fetchQuizResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch quiz data
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) {
        setError(isArabic ? 'الاختبار غير موجود' : 'Quiz introuvable');
        setLoading(false);
        return;
      }

      const quizData = { id: quizDoc.id, ...quizDoc.data() };
      setQuiz(quizData);

      // Fetch fresh user data to get the latest quiz attempts
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        setError(isArabic ? 'خطأ في تحميل بيانات المستخدم' : 'Erreur de chargement des données utilisateur');
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const attempts = userData?.quizAttempts?.[quizId];
      
      if (!attempts || !attempts[attemptIndex]) {
        setError(isArabic ? 'نتيجة الاختبار غير موجودة' : 'Résultat du quiz introuvable');
        setLoading(false);
        return;
      }

      setAllAttempts(attempts);
      setAttempt(attempts[attemptIndex]);
    } catch (err) {
      console.error('Error fetching quiz results:', err);
      setError(isArabic ? 'خطأ في تحميل النتائج' : 'Erreur lors du chargement des résultats');
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceHistory = () => {
    return allAttempts.map((att, idx) => ({
      attempt: idx + 1,
      score: att.score || 0,
      date: new Date(att.completedAt).toLocaleDateString(isArabic ? 'ar' : 'fr')
    }));
  };

  const exportResultsPDF = async () => {
    if (!quiz || !attempt) return;
    
    try {
      setGeneratingPDF(true);
      toast.loading(isArabic ? 'جاري إنشاء PDF...' : 'Génération du PDF en cours...');

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPos = margin;

      // Helper function to check if we need a new page
      const checkNewPage = (neededSpace = 20) => {
        if (yPos + neededSpace > pageHeight - margin) {
          pdf.addPage();
          yPos = margin;
          return true;
        }
        return false;
      };

      // ========== HEADER SECTION ==========
      // Blue header background
      pdf.setFillColor(37, 99, 235); // Blue-600
      pdf.rect(0, 0, pageWidth, 45, 'F');

      // School/Platform name
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Plateforme Éducative Marocaine', pageWidth / 2, 20, { align: 'center' });

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Résultat du Quiz', pageWidth / 2, 30, { align: 'center' });
      pdf.text(new Date(attempt.completedAt).toLocaleDateString('fr-FR', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      }), pageWidth / 2, 38, { align: 'center' });

      yPos = 55;

      // ========== STUDENT INFO SECTION ==========
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('👤 Informations de l\'Étudiant', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Student info box
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(249, 250, 251);
      pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'FD');
      
      yPos += 6;
      pdf.text(`Nom: ${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`, margin + 5, yPos);
      yPos += 6;
      pdf.text(`Email: ${currentUser?.email || 'N/A'}`, margin + 5, yPos);
      yPos += 6;
      pdf.text(`Niveau: ${userProfile?.level || 'N/A'}`, margin + 5, yPos);
      yPos += 6;
      pdf.text(`Branche: ${userProfile?.branch || 'N/A'}`, margin + 5, yPos);
      
      yPos += 10;

      // ========== TEACHER & COURSE INFO SECTION ==========
      checkNewPage(35);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('👨‍🏫 Informations du Cours', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      // Fetch teacher and course info
      let teacherName = 'N/A';
      let courseName = 'N/A';
      let courseLevel = 'N/A';
      
      try {
        if (quiz.teacherId) {
          const teacherDoc = await getDoc(doc(db, 'users', quiz.teacherId));
          if (teacherDoc.exists()) {
            const teacher = teacherDoc.data();
            teacherName = `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() || 'N/A';
          }
        }
        
        if (quiz.courseId) {
          const courseDoc = await getDoc(doc(db, 'courses', quiz.courseId));
          if (courseDoc.exists()) {
            const course = courseDoc.data();
            courseName = course.titleFr || course.titleAr || 'N/A';
            courseLevel = course.level || 'N/A';
          }
        }
      } catch (err) {
        console.error('Error fetching teacher/course:', err);
      }

      // Teacher & Course info box
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(249, 250, 251);
      pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'FD');
      
      yPos += 6;
      pdf.text(`Professeur: ${teacherName}`, margin + 5, yPos);
      yPos += 6;
      pdf.text(`Cours: ${courseName}`, margin + 5, yPos);
      yPos += 6;
      pdf.text(`Niveau: ${courseLevel}`, margin + 5, yPos);
      yPos += 6;
      pdf.text(`Matière: ${quiz.subject || 'N/A'}`, margin + 5, yPos);
      
      yPos += 10;

      // ========== QUIZ INFO SECTION ==========
      checkNewPage(25);
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📝 Informations du Quiz', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(249, 250, 251);
      pdf.roundedRect(margin, yPos, contentWidth, 19, 3, 3, 'FD');
      
      yPos += 6;
      pdf.text(`Titre: ${quiz.titleFr || quiz.titleAr || 'N/A'}`, margin + 5, yPos);
      yPos += 6;
      pdf.text(`Description: ${quiz.descriptionFr || quiz.descriptionAr || 'N/A'}`, margin + 5, yPos);
      yPos += 6;
      pdf.text(`Nombre de questions: ${quiz.questions?.length || 0}`, margin + 5, yPos);
      
      yPos += 12;

      // ========== SCORE SECTION ==========
      checkNewPage(40);
      
      const score = attempt.score || 0;
      const isPassed = score >= 70;
      
      // Big score box
      pdf.setFillColor(isPassed ? 34 : 220, isPassed ? 197 : 38, isPassed ? 94 : 38); // Green or Red
      pdf.roundedRect(margin, yPos, contentWidth, 30, 5, 5, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(36);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${score}%`, pageWidth / 2, yPos + 18, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(isPassed ? '✓ RÉUSSI' : '✗ NON RÉUSSI', pageWidth / 2, yPos + 26, { align: 'center' });
      
      yPos += 38;

      // Statistics
      const correctCount = quiz.questions?.filter((q, idx) => {
        const userAnswer = attempt.answers[idx];
        if (q.type === 'qcm') {
          return Array.isArray(userAnswer) && Array.isArray(q.correctAnswers) &&
                 userAnswer.length === q.correctAnswers.length &&
                 userAnswer.every(val => q.correctAnswers.includes(val));
        } else if (q.type === 'fill-blank') {
          const allWords = (q.correctAnswerText || '').split(' ');
          const selectedIndices = q.selectedWordIndices || [];
          const correctWords = selectedIndices.map(i => allWords[i]).filter(w => w);
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
          
          let allCorrect = true;
          correctWords.forEach((correctWord, idx) => {
            const userWord = (userAnswers[idx] || '').trim().toLowerCase();
            const correct = (correctWord || '').trim().toLowerCase();
            if (userWord !== correct) allCorrect = false;
          });
          return allCorrect;
        }
        return userAnswer === q.correctAnswer;
      }).length || 0;

      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const col1X = margin + 20;
      const col2X = pageWidth / 2 + 10;
      
      pdf.text(`✓ Réponses correctes: ${correctCount}`, col1X, yPos);
      pdf.text(`✗ Réponses incorrectes: ${(quiz.questions?.length || 0) - correctCount}`, col2X, yPos);
      yPos += 6;
      pdf.text(`⏱ Temps total: ${quiz.timeLimit || 'Illimité'} min`, col1X, yPos);
      pdf.text(`📊 Tentative: ${parseInt(attemptIndex) + 1}`, col2X, yPos);
      
      yPos += 12;

      // ========== QUESTIONS DETAILS SECTION ==========
      pdf.addPage();
      yPos = margin;
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(37, 99, 235);
      pdf.text('Détails des Questions', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      pdf.setTextColor(0, 0, 0);
      
      // Loop through all questions
      quiz.questions.forEach((question, idx) => {
        checkNewPage(50);
        
        const userAnswer = attempt.answers[idx];
        let isCorrect = false;
        
        // Calculate if correct
        if (question.type === 'qcm') {
          isCorrect = Array.isArray(userAnswer) && Array.isArray(question.correctAnswers) &&
                     userAnswer.length === question.correctAnswers.length &&
                     userAnswer.every(val => question.correctAnswers.includes(val));
        } else if (question.type === 'fill-blank') {
          const allWords = (question.correctAnswerText || '').split(' ');
          const selectedIndices = question.selectedWordIndices || [];
          const correctWords = selectedIndices.map(i => allWords[i]).filter(w => w);
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
          
          isCorrect = true;
          correctWords.forEach((correctWord, blankIdx) => {
            const userWord = (userAnswers[blankIdx] || '').trim().toLowerCase();
            const correct = (correctWord || '').trim().toLowerCase();
            if (userWord !== correct) isCorrect = false;
          });
        } else {
          isCorrect = userAnswer === question.correctAnswer;
        }
        
        // Question box
        pdf.setDrawColor(isCorrect ? 34 : 220, isCorrect ? 197 : 38, isCorrect ? 94 : 38);
        pdf.setLineWidth(0.5);
        pdf.rect(margin, yPos, contentWidth, 0, 'S'); // Top line only
        
        // Question number and status
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(isCorrect ? 34 : 220, isCorrect ? 197 : 38, isCorrect ? 94 : 38);
        pdf.text(`Question ${idx + 1} ${isCorrect ? '✓' : '✗'}`, margin + 2, yPos + 6);
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        yPos += 10;
        
        // Question text
        const questionText = question.question || question.questionFr || question.questionAr || '';
        const lines = pdf.splitTextToSize(questionText, contentWidth - 10);
        pdf.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
        
        // Answer details based on type
        if (question.type === 'fill-blank') {
          // Show user's answer
          pdf.setFont('helvetica', 'bold');
          pdf.text('Votre réponse:', margin + 5, yPos);
          yPos += 5;
          
          pdf.setFont('helvetica', 'normal');
          const sentenceWithBlanks = question.questionWithBlanks || question.question || '';
          const parts = sentenceWithBlanks.split('_____');
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
          
          let answerText = '';
          parts.forEach((part, partIdx) => {
            answerText += part;
            if (partIdx < parts.length - 1) {
              answerText += `[${userAnswers[partIdx] || 'vide'}]`;
            }
          });
          
          const answerLines = pdf.splitTextToSize(answerText, contentWidth - 15);
          pdf.text(answerLines, margin + 10, yPos);
          yPos += answerLines.length * 5 + 3;
          
          // Show correct answer if wrong
          if (!isCorrect) {
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(34, 197, 94);
            pdf.text('Réponse correcte:', margin + 5, yPos);
            yPos += 5;
            
            pdf.setFont('helvetica', 'normal');
            const correctLines = pdf.splitTextToSize(question.correctAnswerText || '', contentWidth - 15);
            pdf.text(correctLines, margin + 10, yPos);
            yPos += correctLines.length * 5;
          }
        } else if (question.options) {
          // For MCQ/QCU
          question.options.forEach((option, optIdx) => {
            const isUserAnswer = question.type === 'qcm' 
              ? Array.isArray(userAnswer) && userAnswer.includes(optIdx)
              : userAnswer === optIdx;
            const isCorrectAnswer = question.type === 'qcm'
              ? Array.isArray(question.correctAnswers) && question.correctAnswers.includes(optIdx)
              : question.correctAnswer === optIdx;
            
            pdf.setTextColor(0, 0, 0);
            pdf.setFont('helvetica', isCorrectAnswer ? 'bold' : 'normal');
            
            let prefix = `${String.fromCharCode(65 + optIdx)}. `;
            if (isCorrectAnswer) prefix = '✓ ' + prefix;
            if (isUserAnswer && !isCorrect) prefix = '✗ ' + prefix;
            if (isUserAnswer) prefix += '(Votre réponse) ';
            
            const optionLines = pdf.splitTextToSize(prefix + option, contentWidth - 15);
            pdf.text(optionLines, margin + 10, yPos);
            yPos += optionLines.length * 5;
          });
        }
        
        pdf.setTextColor(0, 0, 0);
        yPos += 8;
      });

      // ========== FOOTER ON LAST PAGE ==========
      const finalY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Document généré automatiquement par la Plateforme Éducative Marocaine', pageWidth / 2, finalY, { align: 'center' });
      pdf.text(`Date de génération: ${new Date().toLocaleString('fr-FR')}`, pageWidth / 2, finalY + 4, { align: 'center' });

      // ========== SAVE PDF ==========
      const fileName = `Resultat-Quiz-${userProfile?.firstName || 'Student'}-${quiz.titleFr || 'Quiz'}-${new Date().toLocaleDateString('fr-FR')}.pdf`;
      pdf.save(fileName);

      toast.dismiss();
      toast.success(isArabic ? 'تم تحميل PDF بنجاح!' : 'PDF téléchargé avec succès!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.dismiss();
      toast.error(isArabic ? 'خطأ في إنشاء PDF' : 'Erreur lors de la génération du PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  const exportResults = () => {
    if (!quiz || !attempt) return;

    const title = isArabic ? quiz.titleAr : quiz.titleFr;
    const score = attempt.score || 0;
    const total = quiz.questions?.length || 0;
    const correctCount = attempt.answers?.filter((ans, idx) => {
      const question = quiz.questions[idx];
      return ans === question.correctAnswer;
    }).length || 0;

    let summary = `=== ${isArabic ? 'نتائج الاختبار' : 'Résultats du Quiz'} ===\n\n`;
    summary += `${isArabic ? 'العنوان' : 'Titre'}: ${title}\n`;
    summary += `${isArabic ? 'النتيجة' : 'Score'}: ${score}%\n`;
    summary += `${isArabic ? 'الإجابات الصحيحة' : 'Réponses correctes'}: ${correctCount}/${total}\n`;
    summary += `${isArabic ? 'التاريخ' : 'Date'}: ${new Date(attempt.completedAt).toLocaleString()}\n`;
    summary += `\n${isArabic ? 'تفاصيل الأسئلة' : 'Détails des questions'}:\n\n`;

    quiz.questions.forEach((question, idx) => {
      const userAnswer = attempt.answers[idx];
      const isCorrect = userAnswer === question.correctAnswer;
      
      summary += `${idx + 1}. ${isArabic ? question.questionAr : question.questionFr}\n`;
      summary += `   ${isArabic ? 'إجابتك' : 'Votre réponse'}: ${question.options[userAnswer] || (isArabic ? 'لا إجابة' : 'Pas de réponse')}\n`;
      summary += `   ${isArabic ? 'الإجابة الصحيحة' : 'Réponse correcte'}: ${question.options[question.correctAnswer]}\n`;
      summary += `   ${isArabic ? 'الحالة' : 'Statut'}: ${isCorrect ? '✓' : '✗'}\n`;
      if (question.explanation) {
        summary += `   ${isArabic ? 'التوضيح' : 'Explication'}: ${isArabic ? question.explanationAr || question.explanation : question.explanation}\n`;
      }
      summary += '\n';
    });

    // Create and download file
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-results-${quizId}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(isArabic ? 'تم تحميل النتائج' : 'Résultats téléchargés');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            {isArabic ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-md">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isArabic ? 'خطأ' : 'Erreur'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {isArabic ? 'العودة إلى لوحة التحكم' : 'Retour au tableau de bord'}
          </button>
        </div>
      </div>
    );
  }

  if (!quiz || !attempt) return null;

  const score = attempt.score || 0;
  const totalQuestions = quiz.questions?.length || 0;
  const correctCount = attempt.answers?.filter((ans, idx) => {
    const question = quiz.questions[idx];
    return ans === question.correctAnswer;
  }).length || 0;
  const isPassed = score >= 70;
  const performanceHistory = getPerformanceHistory();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 mb-4 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            {isArabic ? 'العودة إلى لوحة التحكم' : 'Retour au tableau de bord'}
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isArabic ? quiz.titleAr : quiz.titleFr}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'نتائج الاختبار' : 'Résultats du quiz'}
            </p>
          </div>
        </div>

        {/* Score Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Score Card */}
            <div className={`${isPassed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border-2 rounded-lg p-4 text-center`}>
              <TrophyIcon className={`w-8 h-8 mx-auto mb-2 ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
              <div className={`text-3xl font-bold mb-1 ${isPassed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {score}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? 'النتيجة النهائية' : 'Score final'}
              </div>
            </div>

            {/* Correct Answers */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 text-center">
              <ChartBarIcon className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {correctCount}/{totalQuestions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? 'إجابات صحيحة' : 'Réponses correctes'}
              </div>
            </div>

            {/* Completion Date */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4 text-center">
              <ClockIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mb-1">
                {new Date(attempt.completedAt).toLocaleDateString(isArabic ? 'ar' : 'fr')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? 'تاريخ الإكمال' : 'Date de complétion'}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg ${
              isPassed 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {isPassed ? (
                <>
                  <CheckCircleIcon className="w-6 h-6" />
                  {isArabic ? 'ناجح - نتيجة ممتازة!' : 'Réussi - Excellent travail!'}
                </>
              ) : (
                <>
                  <XCircleIcon className="w-6 h-6" />
                  {isArabic ? 'لم ينجح - حاول مرة أخرى!' : 'Non réussi - Réessayez!'}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Performance History Graph */}
        {performanceHistory.length > 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'تاريخ الأداء' : 'Historique des performances'}
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="attempt" 
                  label={{ value: isArabic ? 'المحاولة' : 'Tentative', position: 'insideBottom', offset: -5 }}
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <YAxis 
                  label={{ value: isArabic ? 'النتيجة %' : 'Score %', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value}%`, isArabic ? 'النتيجة' : 'Score']}
                  labelFormatter={(label) => `${isArabic ? 'المحاولة' : 'Tentative'} ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Export Buttons */}
        <div className="mb-6 flex flex-wrap justify-center gap-4">
          <button
            onClick={exportResultsPDF}
            disabled={generatingPDF}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
          >
            <DocumentArrowDownIcon className="w-5 h-5" />
            {generatingPDF 
              ? (isArabic ? 'جاري الإنشاء...' : 'Génération...')
              : (isArabic ? 'تحميل PDF' : 'Télécharger PDF')
            }
          </button>
          <button
            onClick={exportResults}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-md"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {isArabic ? 'تحميل TXT' : 'Télécharger TXT'}
          </button>
        </div>

        {/* Question-by-Question Breakdown */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {isArabic ? 'تفاصيل الأسئلة' : 'Détails des questions'}
          </h2>

          {quiz.questions.map((question, idx) => {
            // Deserialize answer if it's a string (for QCM questions that were serialized)
            let userAnswer = attempt.answers[idx];
            if (question.type === 'qcm' && typeof userAnswer === 'string' && userAnswer.includes(',')) {
              userAnswer = userAnswer.split(',').map(Number);
            }
            
            // Calculate string similarity for fill-blank (same as QuizTaking)
            const calculateStringSimilarity = (str1, str2) => {
              const len1 = str1.length;
              const len2 = str2.length;
              if (len1 === 0) return len2 === 0 ? 1 : 0;
              if (len2 === 0) return 0;
              const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
              for (let i = 0; i <= len1; i++) matrix[i][0] = i;
              for (let j = 0; j <= len2; j++) matrix[0][j] = j;
              for (let i = 1; i <= len1; i++) {
                for (let j = 1; j <= len2; j++) {
                  const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                  matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost
                  );
                }
              }
              const distance = matrix[len1][len2];
              return 1 - (distance / Math.max(len1, len2));
            };
            
            const isCorrect = question.type === 'qcm'
              ? Array.isArray(userAnswer) && Array.isArray(question.correctAnswers) &&
                userAnswer.length === question.correctAnswers.length &&
                userAnswer.every(val => question.correctAnswers.includes(val))
              : question.type === 'fill-blank'
              ? (() => {
                  const ua = (userAnswer || '').toString().trim().toLowerCase();
                  const ca = (question.correctAnswerText || '').trim().toLowerCase();
                  return ua === ca || calculateStringSimilarity(ua, ca) >= 0.85;
                })()
              : userAnswer === question.correctAnswer;

            return (
              <div 
                key={idx}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${
                  isCorrect 
                    ? 'border-green-500 dark:border-green-400' 
                    : 'border-red-500 dark:border-red-400'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-start gap-3 mb-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    isCorrect 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {isArabic ? question.questionAr : question.questionFr}
                    </h3>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {isCorrect ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <CheckCircleIcon className="w-5 h-5" />
                          <span className="font-medium text-sm">
                            {isArabic ? 'صحيح' : 'Correct'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                          <XCircleIcon className="w-5 h-5" />
                          <span className="font-medium text-sm">
                            {isArabic ? 'خاطئ' : 'Incorrect'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Options - Only for MCQ/QCU/True-False */}
                {question.type !== 'fill-blank' && question.options && (
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIdx) => {
                    const isUserAnswer = question.type === 'qcm' 
                      ? Array.isArray(userAnswer) && userAnswer.includes(optIdx)
                      : userAnswer === optIdx;
                    const isCorrectAnswer = question.type === 'qcm'
                      ? Array.isArray(question.correctAnswers) && question.correctAnswers.includes(optIdx)
                      : question.correctAnswer === optIdx;
                    
                    let className = 'p-3 rounded-lg border-2 ';
                    if (isCorrectAnswer) {
                      className += 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-900 dark:text-green-100';
                    } else if (isUserAnswer && !isCorrect) {
                      className += 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100';
                    } else {
                      className += 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300';
                    }

                    return (
                      <div key={optIdx} className={className}>
                        <div className="flex items-center gap-2">
                          {isCorrectAnswer && (
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                          )}
                          {isUserAnswer && !isCorrect && (
                            <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                          )}
                          <span className="font-medium">{String.fromCharCode(65 + optIdx)}.</span>
                          <span>{option}</span>
                          {isUserAnswer && (
                            <span className="ml-auto text-sm font-semibold">
                              {isArabic ? '(إجابتك)' : '(Votre réponse)'}
                            </span>
                          )}
                          {isCorrectAnswer && (
                            <span className="ml-auto text-sm font-semibold">
                              {isArabic ? '(الإجابة الصحيحة)' : '(Réponse correcte)'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}

                {/* Fill-in-the-Blank Answer Display */}
                {question.type === 'fill-blank' && (
                  <div className="space-y-3 mb-4">
                    {/* Question Text */}
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        {isArabic ? 'السؤال:' : 'Question:'}
                      </p>
                      <p className="text-base text-gray-900 dark:text-white">
                        {question.question || (isArabic ? 'غير متوفر' : 'Non disponible')}
                      </p>
                    </div>

                    {/* User's Answer - Show filled sentence with individual blank validation */}
                    <div className="p-4 rounded-lg border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            {isArabic ? 'إجابتك:' : 'Votre réponse:'}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-base">
                            {(() => {
                              const sentenceWithBlanks = question.questionWithBlanks || question.question || '';
                              const parts = sentenceWithBlanks.split('_____');
                              const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
                              
                              // Get correct words
                              const allWords = (question.correctAnswerText || '').split(' ');
                              const selectedIndices = question.selectedWordIndices || [];
                              const correctWords = selectedIndices.map(i => allWords[i]).filter(w => w);
                              
                              return parts.map((part, partIdx) => (
                                <span key={partIdx} className="inline-flex items-center gap-2">
                                  <span className="text-gray-900 dark:text-white">
                                    {part}
                                  </span>
                                  {partIdx < parts.length - 1 && (() => {
                                    const userWord = (userAnswers[partIdx] || '').trim().toLowerCase();
                                    const correctWord = (correctWords[partIdx] || '').trim().toLowerCase();
                                    const isBlankCorrect = userWord === correctWord || calculateStringSimilarity(userWord, correctWord) >= 0.85;
                                    
                                    return (
                                      <span className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 ${
                                        isBlankCorrect
                                          ? 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100' 
                                          : 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100'
                                      }`}>
                                        {isBlankCorrect ? (
                                          <CheckCircleIcon className="w-4 h-4" />
                                        ) : (
                                          <XCircleIcon className="w-4 h-4" />
                                        )}
                                        {userAnswers[partIdx] || (isArabic ? '(فارغ)' : '(vide)')}
                                      </span>
                                    );
                                  })()}
                                </span>
                              ));
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="p-4 rounded-lg border-2 bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700">
                      <div className="flex items-start gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                            {isArabic ? 'الإجابة الصحيحة:' : 'Réponse correcte:'}
                          </p>
                          <p className="font-medium text-green-900 dark:text-green-100 text-base">
                            {question.correctAnswerText || (isArabic ? 'غير متوفر' : 'Non disponible')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {question.explanation && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                      {isArabic ? '💡 التوضيح:' : '💡 Explication:'}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                      {isArabic ? (question.explanationAr || question.explanation) : question.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Retry Button */}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to={`/quiz/${quizId}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition shadow-md"
          >
            {isArabic ? 'إعادة المحاولة' : 'Réessayer'}
          </Link>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition shadow-md"
          >
            {isArabic ? 'العودة إلى لوحة التحكم' : 'Retour au tableau de bord'}
          </button>
        </div>
      </div>
    </div>
  );
}
