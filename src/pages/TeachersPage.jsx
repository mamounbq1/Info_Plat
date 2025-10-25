import { useState } from 'react';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { AcademicCapIcon, EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function TeachersPage() {
  const { isArabic } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Sample teachers - in real app would fetch from Firestore
  const teachers = [
    {
      id: 1,
      name: { fr: 'Dr. Amina Benali', ar: 'د. أمينة بنعلي' },
      subject: { fr: 'Mathématiques', ar: 'الرياضيات' },
      email: 'amina.benali@lycee-excellence.ma',
      experience: { fr: '15 ans', ar: '15 سنة' },
      education: { fr: 'Doctorat en Mathématiques', ar: 'دكتوراه في الرياضيات' }
    },
    {
      id: 2,
      name: { fr: 'M. Omar Alami', ar: 'السيد عمر العلمي' },
      subject: { fr: 'Physique-Chimie', ar: 'الفيزياء والكيمياء' },
      email: 'omar.alami@lycee-excellence.ma',
      experience: { fr: '12 ans', ar: '12 سنة' },
      education: { fr: 'Master en Physique', ar: 'ماجستير في الفيزياء' }
    },
    {
      id: 3,
      name: { fr: 'Mme. Fatima Zahra', ar: 'السيدة فاطمة الزهراء' },
      subject: { fr: 'Français', ar: 'اللغة الفرنسية' },
      email: 'fatima.zahra@lycee-excellence.ma',
      experience: { fr: '10 ans', ar: '10 سنوات' },
      education: { fr: 'Master en Littérature', ar: 'ماجستير في الأدب' }
    },
    {
      id: 4,
      name: { fr: 'M. Karim Berrada', ar: 'السيد كريم برادة' },
      subject: { fr: 'Informatique', ar: 'المعلوميات' },
      email: 'karim.berrada@lycee-excellence.ma',
      experience: { fr: '8 ans', ar: '8 سنوات' },
      education: { fr: 'Ingénieur Informatique', ar: 'مهندس معلوماتية' }
    }
  ];

  const filteredTeachers = teachers.filter(teacher => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const name = isArabic ? teacher.name.ar : teacher.name.fr;
    const subject = isArabic ? teacher.subject.ar : teacher.subject.fr;
    return name.toLowerCase().includes(search) || subject.toLowerCase().includes(search);
  });

  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <AcademicCapIcon className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'طاقم التدريس' : 'Corps Enseignant'}
            </h1>
            <p className="text-xl text-blue-100">
              {isArabic 
                ? 'تعرف على معلمينا المتفانين والمؤهلين'
                : 'Rencontrez notre équipe enseignante dévouée et qualifiée'}
            </p>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={isArabic ? 'البحث عن مدرس أو مادة...' : 'Rechercher un enseignant ou matière...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
              {filteredTeachers.length} {isArabic ? 'أستاذ' : 'enseignant(s)'}
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Grid */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
              >
                {/* Avatar */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                    <AcademicCapIcon className="w-16 h-16 text-blue-600" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {isArabic ? teacher.name.ar : teacher.name.fr}
                  </h3>
                  
                  <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">
                    {isArabic ? teacher.subject.ar : teacher.subject.fr}
                  </p>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <p>
                      <strong>{isArabic ? 'الخبرة:' : 'Expérience:'}</strong>{' '}
                      {isArabic ? teacher.experience.ar : teacher.experience.fr}
                    </p>
                    <p>
                      <strong>{isArabic ? 'التعليم:' : 'Formation:'}</strong>{' '}
                      {isArabic ? teacher.education.ar : teacher.education.fr}
                    </p>
                  </div>

                  <a
                    href={`mailto:${teacher.email}`}
                    className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <EnvelopeIcon className="w-5 h-5" />
                    <span className="text-sm">{isArabic ? 'إرسال بريد إلكتروني' : 'Envoyer un email'}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
