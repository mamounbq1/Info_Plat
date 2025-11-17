import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  LinkIcon,
  EyeIcon,
  FolderIcon,
  LockClosedIcon,
  CheckCircleIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline';
import { canAccessQuizOrExercise, getCourseProgress, matchesStudentClassOrLevel } from '../utils/courseProgress';

export default function AvailableExercises({ exercises, userProfile, isArabic }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid' - default is LIST

  // ACADEMIC HIERARCHY: Filter exercises by student's class/level
  const filteredExercises = exercises.filter(exercise => matchesStudentClassOrLevel(exercise, userProfile));

  // Sort exercises by creation date (newest first)
  const sortedExercises = [...filteredExercises].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (sortedExercises.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
          {isArabic ? 'التمارين المتاحة' : 'Exercices Disponibles'}
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-100 dark:border-gray-700">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-2">
            {isArabic ? 'لا توجد تمارين متاحة حالياً' : 'Aucun exercice disponible pour le moment'}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isArabic 
              ? 'سيتم إضافة التمارين قريباً من قبل المعلمين'
              : 'Les exercices seront bientôt ajoutés par vos enseignants'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'التمارين المتاحة' : 'Exercices Disponibles'}
          <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
            ({sortedExercises.length})
          </span>
        </h2>
        
        {/* View Mode Toggle */}
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              viewMode === 'grid'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isArabic ? 'شبكة' : 'Grille'}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
              viewMode === 'list'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isArabic ? 'قائمة' : 'Liste'}
          </button>
        </div>
      </div>

      {/* Exercises Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3' 
        : 'space-y-3'
      }>
        {sortedExercises.map((exercise) => (
          <ExerciseCard 
            key={exercise.id}
            exercise={exercise}
            isArabic={isArabic}
            viewMode={viewMode}
            userProfile={userProfile}
          />
        ))}
      </div>
    </div>
  );
}

// Exercise Card Component
function ExerciseCard({ exercise, isArabic, viewMode, userProfile }) {
  const navigate = useNavigate();
  
  // Check if exercise is locked based on course completion
  const accessCheck = canAccessQuizOrExercise(userProfile, exercise.courseId);
  const isLocked = !accessCheck.canAccess;
  const progress = getCourseProgress(userProfile, exercise.courseId);
  const getTypeIcon = () => {
    switch(exercise.type) {
      case 'file':
        return DocumentIcon;
      case 'link':
        return LinkIcon;
      case 'text':
        return DocumentTextIcon;
      default:
        return DocumentIcon;
    }
  };

  const getTypeColor = () => {
    switch(exercise.type) {
      case 'file':
        return 'border-purple-200 dark:border-purple-800';
      case 'link':
        return 'border-blue-200 dark:border-blue-800';
      case 'text':
        return 'border-green-200 dark:border-green-800';
      default:
        return 'border-gray-200 dark:border-gray-700';
    }
  };

  const getTypeBadge = () => {
    const badges = {
      file: { label: isArabic ? 'ملف' : 'Fichier', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
      link: { label: isArabic ? 'رابط' : 'Lien', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
      text: { label: isArabic ? 'نص' : 'Texte', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' }
    };
    const badge = badges[exercise.type] || badges.file;
    return (
      <span className={`px-2 py-0.5 ${badge.color} text-xs rounded-full font-medium`}>
        {badge.label}
      </span>
    );
  };

  const TypeIcon = getTypeIcon();

  const handleDownload = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  if (viewMode === 'list') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-4 ${getTypeColor()} group ${isLocked ? 'opacity-60' : ''}`}>
        <div className="p-4 flex items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-purple-100 dark:bg-purple-900/30">
            <TypeIcon className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1 flex items-center gap-2" dir="auto">
                {exercise.title || exercise.titleFr || (isArabic ? exercise.titleAr : exercise.titleFr)}
                {isLocked && <LockClosedIcon className="w-5 h-5 text-red-500" />}
                {!isLocked && exercise.courseId && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
              </h3>
              {getTypeBadge()}
            </div>

            {/* Description */}
            {exercise.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2" dir="auto">
                {exercise.description || exercise.descriptionFr || exercise.descriptionAr}
              </p>
            )}

            {/* Course Prerequisite Status */}
            {exercise.courseId && (
              <div className="mb-2">
                {isLocked ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                    <p className="text-red-700 dark:text-red-400 text-xs font-medium">
                      🔒 {isArabic ? 'مغلق' : 'Verrouillé'} - {isArabic ? `يجب إكمال الدرس أولاً (${progress}%)` : `Terminez le cours d'abord (${progress}%)`}
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2">
                    <p className="text-green-700 dark:text-green-400 text-xs font-medium flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" />
                      {isArabic ? 'متاح' : 'Disponible'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {exercise.difficulty && (
                <span className={`px-2 py-0.5 rounded ${
                  exercise.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  exercise.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}>
                  {exercise.difficulty}
                </span>
              )}
              {exercise.files && exercise.files.length > 1 && (
                <span className="flex items-center gap-1">
                  <FolderIcon className="w-4 h-4" />
                  {exercise.files.length} {isArabic ? 'ملف' : 'fichiers'}
                </span>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            {isLocked ? (
              <button
                disabled
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 bg-gray-400 text-white cursor-not-allowed"
              >
                <LockClosedIcon className="w-4 h-4" />
                {isArabic ? 'مغلق' : 'Verrouillé'}
              </button>
            ) : (
              <button
                onClick={() => navigate(`/exercise/${exercise.id}`)}
                className="px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
              >
                <PencilSquareIcon className="w-4 h-4" />
                {isArabic ? 'بدء التمرين' : 'Passer l\'exercice'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border-2 ${getTypeColor()} group ${isLocked ? 'opacity-60' : ''}`}>
      {/* Header with Icon */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
        <div className="flex items-start justify-between mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-500">
            <TypeIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-1">
            {getTypeBadge()}
            {isLocked && <LockClosedIcon className="w-4 h-4 text-red-500" />}
            {!isLocked && exercise.courseId && <CheckCircleIcon className="w-4 h-4 text-green-500" />}
          </div>
        </div>
        
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight min-h-[2.5rem]" dir="auto">
          {exercise.title || exercise.titleFr || (isArabic ? exercise.titleAr : exercise.titleFr)}
        </h3>
      </div>

      {/* Body */}
      <div className="p-3">
        {/* Course Prerequisite Status */}
        {exercise.courseId && (
          <div className="mb-3">
            {isLocked ? (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                <p className="text-red-700 dark:text-red-400 text-xs font-medium text-center">
                  🔒 {isArabic ? 'مغلق' : 'Verrouillé'}
                </p>
                <p className="text-red-600 dark:text-red-500 text-xs text-center mt-1">
                  {isArabic ? `التقدم: ${progress}%` : `Progression: ${progress}%`}
                </p>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-2">
                <p className="text-green-700 dark:text-green-400 text-xs font-medium text-center flex items-center justify-center gap-1">
                  <CheckCircleIcon className="w-3 h-3" />
                  {isArabic ? 'متاح' : 'Disponible'}
                </p>
              </div>
            )}
          </div>
        )}
        {/* Description */}
        {exercise.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3" dir="auto">
            {exercise.description || exercise.descriptionFr || exercise.descriptionAr}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {exercise.difficulty && (
            <span className={`px-2 py-0.5 text-xs rounded ${
              exercise.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
              exercise.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {exercise.difficulty}
            </span>
          )}
          {exercise.files && exercise.files.length > 1 && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded flex items-center gap-1">
              <FolderIcon className="w-3 h-3" />
              {exercise.files.length}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div>
          {isLocked ? (
            <button
              disabled
              className="w-full text-center py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 bg-gray-400 text-white cursor-not-allowed"
            >
              <LockClosedIcon className="w-4 h-4" />
              {isArabic ? 'مغلق' : 'Verrouillé'}
            </button>
          ) : (
            <button
              onClick={() => navigate(`/exercise/${exercise.id}`)}
              className="w-full text-center py-2 px-3 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              <PencilSquareIcon className="w-4 h-4" />
              {isArabic ? 'بدء التمرين' : 'Passer l\'exercice'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
