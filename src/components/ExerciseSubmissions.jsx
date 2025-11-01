import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ExerciseSubmissions({ exercise, isArabic, onClose }) {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [exercise.id]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      const submissionsQuery = query(
        collection(db, 'exerciseSubmissions'),
        where('exerciseId', '==', exercise.id),
        orderBy('submittedAt', 'desc')
      );

      const snapshot = await getDocs(submissionsQuery);
      const submissionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error(isArabic ? 'خطأ في تحميل الإجابات' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = async (submissionId, grade, feedback) => {
    try {
      setGrading(true);
      
      await updateDoc(doc(db, 'exerciseSubmissions', submissionId), {
        grade: grade,
        feedback: feedback,
        gradedAt: new Date().toISOString(),
        gradedBy: 'teacher' // Could be teacher ID/name
      });

      toast.success(isArabic ? 'تم تقييم الإجابة' : 'Réponse évaluée');
      fetchSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error(isArabic ? 'خطأ في التقييم' : 'Erreur d\'évaluation');
    } finally {
      setGrading(false);
    }
  };

  const stats = {
    total: submissions.length,
    graded: submissions.filter(s => s.grade !== undefined && s.grade !== null).length,
    pending: submissions.filter(s => s.grade === undefined || s.grade === null).length,
    averageGrade: submissions.filter(s => s.grade).reduce((sum, s) => sum + s.grade, 0) / submissions.filter(s => s.grade).length || 0
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isArabic ? 'إجابات التمرين' : 'Soumissions Exercice'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {isArabic ? exercise.titleAr : exercise.titleFr}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {isArabic ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'الإجمالي' : 'Total'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'مُقيّم' : 'Évalué'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.graded}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClockIcon className="w-8 h-8 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'قيد الانتظار' : 'En Attente'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.pending}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? 'المعدل' : 'Moyenne'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.averageGrade ? `${Math.round(stats.averageGrade * 10) / 10}/20` : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submissions List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {isArabic ? 'قائمة الإجابات' : 'Liste des Soumissions'}
              </h3>

              {submissions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {isArabic ? 'لا توجد إجابات بعد' : 'Aucune soumission pour le moment'}
                </div>
              ) : (
                <div className="space-y-2">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {submission.studentName || submission.studentEmail}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <CalendarIcon className="w-3 h-3" />
                            <span>
                              {new Date(submission.submittedAt).toLocaleString(isArabic ? 'ar' : 'fr')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {submission.grade !== undefined && submission.grade !== null ? (
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {submission.grade}/20
                            </div>
                            <div className="text-xs text-gray-500">
                              {isArabic ? 'مُقيّم' : 'Évalué'}
                            </div>
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium">
                            {isArabic ? 'قيد الانتظار' : 'En attente'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Detailed Submission Modal */}
        {selectedSubmission && (
          <SubmissionDetailModal
            submission={selectedSubmission}
            exercise={exercise}
            isArabic={isArabic}
            grading={grading}
            onClose={() => setSelectedSubmission(null)}
            onGrade={handleGrade}
          />
        )}
      </div>
    </div>
  );
}

// Submission Detail Modal
function SubmissionDetailModal({ submission, exercise, isArabic, grading, onClose, onGrade }) {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');

  const handleSubmitGrade = () => {
    if (grade === '' || grade < 0 || grade > 20) {
      toast.error(isArabic ? 'أدخل علامة صحيحة (0-20)' : 'Entrez une note valide (0-20)');
      return;
    }
    onGrade(submission.id, parseFloat(grade), feedback);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {isArabic ? 'تفاصيل الإجابة' : 'Détail de la Soumission'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {submission.studentName || submission.studentEmail}
            </p>
          </div>
          <button onClick={onClose} className="text-2xl text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Submission Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">
                  {isArabic ? 'تاريخ التقديم' : 'Date de soumission'}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(submission.submittedAt).toLocaleString(isArabic ? 'ar' : 'fr')}
                </p>
              </div>
              {submission.gradedAt && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {isArabic ? 'تاريخ التقييم' : 'Date d\'évaluation'}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(submission.gradedAt).toLocaleString(isArabic ? 'ar' : 'fr')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Student Answer */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              {isArabic ? 'إجابة الطالب' : 'Réponse de l\'étudiant'}
            </h4>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                {submission.answer || (isArabic ? 'لا توجد إجابة' : 'Pas de réponse')}
              </p>
            </div>
          </div>

          {/* Grading Section */}
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'التقييم' : 'Évaluation'}
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'العلامة (من 20)' : 'Note (sur 20)'}
                </label>
                <input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  min="0"
                  max="20"
                  step="0.5"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="15.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'التعليق' : 'Commentaire'}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="4"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder={isArabic ? 'أضف تعليقاً للطالب...' : 'Ajoutez un commentaire pour l\'étudiant...'}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitGrade}
                  disabled={grading}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {grading 
                    ? (isArabic ? 'جاري الحفظ...' : 'Enregistrement...')
                    : (isArabic ? 'حفظ التقييم' : 'Enregistrer l\'Évaluation')
                  }
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
