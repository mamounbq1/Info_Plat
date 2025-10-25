import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';
import { UserPlusIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function EnrollmentPage() {
  const { isArabic } = useLanguage();
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    email: '',
    phone: '',
    level: '',
    branch: '',
    previousSchool: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    toast.success(isArabic ? 'تم إرسال طلبك بنجاح!' : 'Votre demande a été envoyée avec succès!');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <div className="container mx-auto px-4 py-20 mt-20">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'شكراً لتسجيلك!' : 'Merci pour votre inscription!'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
              {isArabic 
                ? 'سنتصل بك قريباً لاستكمال عملية التسجيل.'
                : 'Nous vous contacterons bientôt pour finaliser votre inscription.'
              }
            </p>
            <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Retour à l\'accueil'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-20">
        <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeftIcon className="w-5 h-5" />
          {isArabic ? 'العودة' : 'Retour'}
        </Link>

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <UserPlusIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'نموذج التسجيل' : 'Formulaire d\'Inscription'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isArabic ? 'املأ النموذج أدناه للتسجيل' : 'Remplissez le formulaire ci-dessous pour vous inscrire'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'اسم الطالب' : 'Nom de l\'étudiant'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'اسم ولي الأمر' : 'Nom du parent'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.parentName}
                  onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الهاتف' : 'Téléphone'} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'المستوى' : 'Niveau'} *
                </label>
                <select
                  required
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isArabic ? 'اختر المستوى' : 'Choisir le niveau'}</option>
                  <option value="TC">{isArabic ? 'الجذع المشترك' : 'Tronc Commun'}</option>
                  <option value="1BAC">{isArabic ? 'الأولى باكالوريا' : '1ère Bac'}</option>
                  <option value="2BAC">{isArabic ? 'الثانية باكالوريا' : '2ème Bac'}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'الشعبة' : 'Filière'} *
                </label>
                <select
                  required
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{isArabic ? 'اختر الشعبة' : 'Choisir la filière'}</option>
                  <option value="Sciences">{isArabic ? 'علوم' : 'Sciences'}</option>
                  <option value="Lettres">{isArabic ? 'آداب' : 'Lettres'}</option>
                  <option value="Economie">{isArabic ? 'اقتصاد' : 'Économie'}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المدرسة السابقة' : 'École précédente'}
              </label>
              <input
                type="text"
                value={formData.previousSchool}
                onChange={(e) => setFormData({...formData, previousSchool: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'رسالة إضافية' : 'Message supplémentaire'}
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold transition"
            >
              {isArabic ? 'إرسال الطلب' : 'Envoyer la demande'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
