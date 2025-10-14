import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { AcademicCapIcon, BookOpenIcon, ClipboardDocumentCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const { t, isArabic } = useLanguage();

  const features = [
    {
      icon: BookOpenIcon,
      titleFr: 'Cours Complets',
      titleAr: 'دروس كاملة',
      descFr: 'Accédez à des cours détaillés pour Tronc Commun avec PDFs, vidéos et ressources',
      descAr: 'الوصول إلى دروس مفصلة للجذع المشترك مع ملفات PDF ومقاطع فيديو وموارد'
    },
    {
      icon: ClipboardDocumentCheckIcon,
      titleFr: 'Quiz Interactifs',
      titleAr: 'اختبارات تفاعلية',
      descFr: 'Testez vos connaissances avec des quiz et des devoirs interactifs',
      descAr: 'اختبر معرفتك بالاختبارات والواجبات التفاعلية'
    },
    {
      icon: AcademicCapIcon,
      titleFr: 'Suivi de Progression',
      titleAr: 'تتبع التقدم',
      descFr: 'Suivez votre progression et vos résultats en temps réel',
      descAr: 'تتبع تقدمك ونتائجك في الوقت الفعلي'
    },
    {
      icon: UserGroupIcon,
      titleFr: 'Communauté Active',
      titleAr: 'مجتمع نشط',
      descFr: 'Interagissez avec vos professeurs et camarades de classe',
      descAr: 'تفاعل مع معلميك وزملائك في الفصل'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {isArabic ? 'منصة التعليم المغربية' : 'Plateforme Éducative Marocaine'}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {isArabic 
              ? 'منصة تعليمية شاملة لطلاب الجذع المشترك في المغرب. الوصول إلى الدروس والاختبارات والموارد في مكان واحد'
              : 'Plateforme éducative complète pour les élèves de Tronc Commun au Maroc. Accédez aux cours, quiz et ressources en un seul endroit'
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
            >
              {isArabic ? 'ابدأ الآن' : 'Commencer Maintenant'}
            </Link>
            <Link 
              to="/login" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition shadow-lg border-2 border-blue-600"
            >
              {t('login')}
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <feature.icon className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isArabic ? feature.titleAr : feature.titleFr}
              </h3>
              <p className="text-gray-600">
                {isArabic ? feature.descAr : feature.descFr}
              </p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-blue-600 rounded-2xl p-12 text-center text-white mt-20">
          <h2 className="text-3xl font-bold mb-4">
            {isArabic ? 'هل أنت مدرس؟' : 'Vous êtes professeur?'}
          </h2>
          <p className="text-xl mb-6">
            {isArabic 
              ? 'انضم كمسؤول وابدأ في مشاركة المحتوى مع طلابك'
              : 'Rejoignez en tant qu\'administrateur et commencez à partager du contenu avec vos élèves'
            }
          </p>
          <Link 
            to="/signup" 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            {isArabic ? 'إنشاء حساب مدرس' : 'Créer un Compte Enseignant'}
          </Link>
        </div>
      </div>
    </div>
  );
}
