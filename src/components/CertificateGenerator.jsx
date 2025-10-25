import { useRef, useState } from 'react';
import { 
  DocumentArrowDownIcon, 
  ShareIcon,
  CheckBadgeIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * Certificate Generator Component
 * Generates beautiful completion certificates for courses
 */
export default function CertificateGenerator({ 
  studentName, 
  courseName, 
  completionDate,
  courseId,
  isArabic = false 
}) {
  const certificateRef = useRef(null);
  const [generating, setGenerating] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? 'ar' : 'fr', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const generatePDF = async () => {
    try {
      setGenerating(true);
      
      // Dynamically import html2canvas and jspdf only when needed
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Get the certificate element
      const element = certificateRef.current;
      
      // Create canvas from HTML
      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        backgroundColor: '#ffffff',
        logging: false
      });

      // Convert canvas to image
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF (A4 landscape)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Download PDF
      const fileName = `certificate-${courseName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      pdf.save(fileName);
      
      toast.success(isArabic ? 'تم تحميل الشهادة بنجاح!' : 'Certificat téléchargé avec succès!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(isArabic ? 'خطأ في إنشاء الشهادة' : 'Erreur lors de la génération du certificat');
    } finally {
      setGenerating(false);
    }
  };

  const shareCertificate = async () => {
    const shareText = isArabic
      ? `🎓 لقد أكملت بنجاح دورة "${courseName}"!\n✅ تم الحصول على الشهادة في ${formatDate(completionDate)}`
      : `🎓 J'ai terminé avec succès le cours "${courseName}"!\n✅ Certificat obtenu le ${formatDate(completionDate)}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: isArabic ? 'شهادة الإنجاز' : 'Certificat de Réussite',
          text: shareText
        });
        toast.success(isArabic ? 'تمت المشاركة!' : 'Partagé!');
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share error:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText);
      toast.success(isArabic ? 'تم نسخ النص!' : 'Texte copié!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <TrophyIcon className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-bold">
                {isArabic ? 'شهادة الإنجاز' : 'Certificat de Réussite'}
              </h3>
              <p className="text-blue-100 text-sm">
                {isArabic ? 'جاهز للتحميل' : 'Prêt à télécharger'}
              </p>
            </div>
          </div>
          <CheckBadgeIcon className="w-10 h-10 text-blue-200" />
        </div>
      </div>

      {/* Certificate Preview */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900">
        <div 
          ref={certificateRef}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ 
            aspectRatio: '297/210', // A4 landscape ratio
            maxWidth: '100%'
          }}
        >
          {/* Certificate Content */}
          <div className="h-full relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 flex flex-col items-center justify-center">
            {/* Decorative Border */}
            <div className="absolute inset-4 border-4 border-blue-600 rounded-lg" />
            <div className="absolute inset-6 border-2 border-blue-300 rounded-lg" />
            
            {/* Content */}
            <div className="relative z-10 text-center space-y-6">
              {/* Trophy Icon */}
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-full shadow-lg">
                  <TrophyIcon className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {isArabic ? 'شهادة إتمام' : 'Certificat de Réussite'}
                </h1>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full" />
              </div>

              {/* Presented to */}
              <div>
                <p className="text-gray-600 text-lg mb-2">
                  {isArabic ? 'هذه الشهادة مُقدمة إلى' : 'Cette attestation est décernée à'}
                </p>
                <h2 className="text-3xl font-bold text-blue-600 mb-1">
                  {studentName}
                </h2>
                <div className="h-0.5 w-64 bg-gray-300 mx-auto" />
              </div>

              {/* Course completion */}
              <div>
                <p className="text-gray-600 mb-2">
                  {isArabic ? 'لإتمام الدورة بنجاح' : 'pour avoir complété avec succès le cours'}
                </p>
                <h3 className="text-2xl font-semibold text-gray-900">
                  {courseName}
                </h3>
              </div>

              {/* Date and Badge */}
              <div className="flex items-center justify-center gap-8 pt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">
                    {isArabic ? 'تاريخ الإنجاز' : 'Date de réussite'}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(completionDate)}
                  </p>
                </div>
                <div className="h-12 w-px bg-gray-300" />
                <div className="text-center">
                  <CheckBadgeIcon className="w-12 h-12 text-green-500 mx-auto" />
                  <p className="text-sm font-medium text-green-600 mt-1">
                    {isArabic ? 'مصادق عليه' : 'Certifié'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500 pt-4">
                <p>{isArabic ? 'منصة التعليم الإلكتروني' : 'Plateforme d\'apprentissage en ligne'}</p>
                <p className="text-xs text-gray-400 mt-1">
                  ID: {courseId.substring(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-gray-100 dark:bg-gray-800 flex gap-3">
        <button
          onClick={generatePDF}
          disabled={generating}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all shadow-sm disabled:opacity-50"
        >
          <DocumentArrowDownIcon className="w-5 h-5" />
          {generating 
            ? (isArabic ? 'جاري الإنشاء...' : 'Génération...')
            : (isArabic ? 'تحميل PDF' : 'Télécharger PDF')
          }
        </button>
        <button
          onClick={shareCertificate}
          className="flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-all"
        >
          <ShareIcon className="w-5 h-5" />
          {isArabic ? 'مشاركة' : 'Partager'}
        </button>
      </div>
    </div>
  );
}

/**
 * Certificate Badge Component
 * Shows a small badge when course is completed
 */
export function CertificateBadge({ onClick, isArabic = false }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
    >
      <TrophyIcon className="w-5 h-5" />
      <span>{isArabic ? 'عرض الشهادة' : 'Voir Certificat'}</span>
    </button>
  );
}

/**
 * Certificate Modal Wrapper
 * Use this to show certificate in a modal
 */
export function CertificateModal({ 
  isOpen, 
  onClose, 
  studentName, 
  courseName, 
  completionDate,
  courseId,
  isArabic 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-4 -right-4 z-10 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <CertificateGenerator
            studentName={studentName}
            courseName={courseName}
            completionDate={completionDate}
            courseId={courseId}
            isArabic={isArabic}
          />
        </div>
      </div>
    </div>
  );
}
