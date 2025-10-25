import { useState, useEffect } from 'react';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  AcademicCapIcon, 
  SparklesIcon, 
  TrophyIcon, 
  UserGroupIcon,
  BuildingLibraryIcon,
  BeakerIcon,
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function AboutPage() {
  const { isArabic } = useLanguage();
  const [aboutContent, setAboutContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    console.log('🔍 [AboutPage] Fetching content from Firebase...');
    try {
      // First try to get from pageContents (new CMS)
      const pageDocRef = doc(db, 'pageContents', 'about');
      console.log('📄 [AboutPage] Checking pageContents/about...');
      const pageSnapshot = await getDoc(pageDocRef);
      
      console.log('✅ [AboutPage] Document exists:', pageSnapshot.exists());
      
      if (pageSnapshot.exists() && pageSnapshot.data().isPublished) {
        const data = pageSnapshot.data();
        console.log('📦 [AboutPage] Data loaded from pageContents:', data);
        console.log('📊 [AboutPage] Values count:', data.values?.items?.length);
        console.log('🏫 [AboutPage] Facilities count:', data.facilities?.items?.length);
        console.log('📅 [AboutPage] Milestones count:', data.history?.milestones?.length);
        
        // Check if it has the new structure (from PageManager)
        if (data.hero && data.hero.title) {
          setAboutContent(data);
          setLoading(false);
          console.log('✅ [AboutPage] Using CMS content from pageContents');
          return;
        }
      } else {
        console.log('⚠️ [AboutPage] Document not published or does not exist');
      }

      // Fallback: Try old homepage collection structure
      console.log('🔄 [AboutPage] Trying fallback: homepage/about...');
      const aboutDocRef = doc(db, 'homepage', 'about');
      const aboutSnapshot = await getDoc(aboutDocRef);
      
      if (aboutSnapshot.exists() && aboutSnapshot.data().enabled) {
        const data = aboutSnapshot.data();
        console.log('📦 [AboutPage] Fallback data loaded from homepage:', data);
        // Validate that the data has the expected structure
        if (data.title && data.title.fr && data.subtitle && data.description) {
          setAboutContent(data);
          console.log('✅ [AboutPage] Using fallback content from homepage');
        }
      } else {
        console.log('⚠️ [AboutPage] No content found, will use defaults');
      }
    } catch (error) {
      console.error('❌ [AboutPage] Error fetching about content:', error);
      console.error('❌ [AboutPage] Error details:', error.message, error.code);
    } finally {
      console.log('🏁 [AboutPage] Loading finished');
      setLoading(false);
    }
  };

  // Default content
  const defaultContent = {
    title: {
      fr: 'À Propos de Lycée Excellence',
      ar: 'حول ثانوية التميز'
    },
    subtitle: {
      fr: 'Un établissement d\'excellence dédié à la réussite de chaque élève',
      ar: 'مؤسسة تعليمية متميزة مكرسة لنجاح كل طالب'
    },
    description: {
      fr: 'Depuis sa création, le Lycée Excellence s\'est imposé comme l\'un des établissements d\'enseignement secondaire les plus prestigieux du Maroc. Notre mission est de fournir une éducation de qualité supérieure qui prépare nos élèves à devenir des citoyens responsables et des leaders de demain.',
      ar: 'منذ تأسيسها، أصبحت ثانوية التميز واحدة من أرقى مؤسسات التعليم الثانوي في المغرب. مهمتنا هي توفير تعليم عالي الجودة يعد طلابنا ليصبحوا مواطنين مسؤولين وقادة الغد.'
    }
  };

  // Always use defaultContent as base and merge with fetched content
  const content = aboutContent ? {
    // Support both old and new CMS structures
    title: aboutContent.hero?.title || aboutContent.title || defaultContent.title,
    subtitle: aboutContent.hero?.subtitle || aboutContent.subtitle || defaultContent.subtitle,
    description: aboutContent.mission?.content || aboutContent.description || defaultContent.description
  } : defaultContent;

  // Values section - Use CMS data if available, otherwise use default
  const defaultValues = [
    {
      icon: LightBulbIcon,
      title: { fr: 'Excellence Académique', ar: 'التميز الأكاديمي' },
      description: { 
        fr: 'Nous visons l\'excellence dans tous les aspects de l\'enseignement et de l\'apprentissage.',
        ar: 'نسعى للتميز في جميع جوانب التدريس والتعلم.'
      },
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: HeartIcon,
      title: { fr: 'Développement Personnel', ar: 'التطوير الشخصي' },
      description: { 
        fr: 'Nous soutenons le développement holistique de chaque élève.',
        ar: 'ندعم التطوير الشامل لكل طالب.'
      },
      color: 'from-red-500 to-pink-600'
    },
    {
      icon: UserGroupIcon,
      title: { fr: 'Esprit Communautaire', ar: 'الروح المجتمعية' },
      description: { 
        fr: 'Nous cultivons un environnement inclusif et bienveillant.',
        ar: 'نرعى بيئة شاملة ورعاية.'
      },
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: RocketLaunchIcon,
      title: { fr: 'Innovation', ar: 'الابتكار' },
      description: { 
        fr: 'Nous encourageons la créativité et l\'innovation dans l\'apprentissage.',
        ar: 'نشجع الإبداع والابتكار في التعلم.'
      },
      color: 'from-purple-500 to-violet-600'
    },
    {
      icon: GlobeAltIcon,
      title: { fr: 'Ouverture Internationale', ar: 'الانفتاح الدولي' },
      description: { 
        fr: 'Nous préparons nos élèves à devenir des citoyens du monde.',
        ar: 'نعد طلابنا ليصبحوا مواطنين عالميين.'
      },
      color: 'from-cyan-500 to-blue-600'
    },
    {
      icon: ShieldCheckIcon,
      title: { fr: 'Intégrité', ar: 'النزاهة' },
      description: { 
        fr: 'Nous promouvons l\'honnêteté, le respect et la responsabilité.',
        ar: 'نعزز الأمانة والاحترام والمسؤولية.'
      },
      color: 'from-orange-500 to-red-600'
    }
  ];

  // Use CMS values if available
  const values = aboutContent?.values?.items?.length > 0 
    ? aboutContent.values.items.map(val => ({
        icon: val.icon === '💡' ? LightBulbIcon :
              val.icon === '❤️' ? HeartIcon :
              val.icon === '👥' ? UserGroupIcon :
              val.icon === '🚀' ? RocketLaunchIcon :
              val.icon === '🌍' ? GlobeAltIcon :
              val.icon === '🛡️' ? ShieldCheckIcon : LightBulbIcon,
        title: val.title,
        description: val.description,
        color: 'from-blue-500 to-blue-600'
      }))
    : defaultValues;

  // Facilities - Use CMS data if available, otherwise use default
  const defaultFacilities = [
    {
      icon: BuildingLibraryIcon,
      title: { fr: 'Bibliothèque Moderne', ar: 'مكتبة حديثة' },
      description: { 
        fr: 'Plus de 15,000 ouvrages et ressources numériques',
        ar: 'أكثر من 15,000 كتاب وموارد رقمية'
      }
    },
    {
      icon: BeakerIcon,
      title: { fr: 'Laboratoires Scientifiques', ar: 'مختبرات علمية' },
      description: { 
        fr: 'Équipements de pointe pour physique, chimie et biologie',
        ar: 'معدات متطورة للفيزياء والكيمياء والبيولوجيا'
      }
    },
    {
      icon: AcademicCapIcon,
      title: { fr: 'Salles Multimedia', ar: 'قاعات الوسائط المتعددة' },
      description: { 
        fr: 'Technologies modernes pour un apprentissage interactif',
        ar: 'تقنيات حديثة للتعلم التفاعلي'
      }
    },
    {
      icon: TrophyIcon,
      title: { fr: 'Installations Sportives', ar: 'مرافق رياضية' },
      description: { 
        fr: 'Terrains de sport, gymnase et piscine',
        ar: 'ملاعب رياضية وصالة رياضية ومسبح'
      }
    }
  ];

  // Use CMS facilities if available
  const facilities = aboutContent?.facilities?.items?.length > 0
    ? aboutContent.facilities.items.map(fac => ({
        icon: fac.icon === '📚' ? BuildingLibraryIcon :
              fac.icon === '🧪' ? BeakerIcon :
              fac.icon === '💻' ? AcademicCapIcon :
              fac.icon === '🏆' ? TrophyIcon : BuildingLibraryIcon,
        title: fac.title,
        description: fac.description
      }))
    : defaultFacilities;

  // History timeline - Use CMS data if available, otherwise use default
  const defaultTimeline = [
    {
      year: '1998',
      title: { fr: 'Fondation', ar: 'التأسيس' },
      description: { 
        fr: 'Création du Lycée Excellence avec 150 élèves',
        ar: 'تأسيس ثانوية التميز مع 150 طالب'
      }
    },
    {
      year: '2005',
      title: { fr: 'Expansion', ar: 'التوسع' },
      description: { 
        fr: 'Construction du nouveau campus et des laboratoires modernes',
        ar: 'بناء الحرم الجامعي الجديد والمختبرات الحديثة'
      }
    },
    {
      year: '2012',
      title: { fr: 'Accréditation Internationale', ar: 'الاعتماد الدولي' },
      description: { 
        fr: 'Obtention de l\'accréditation internationale IB',
        ar: 'الحصول على الاعتماد الدولي IB'
      }
    },
    {
      year: '2020',
      title: { fr: 'Transformation Digitale', ar: 'التحول الرقمي' },
      description: { 
        fr: 'Lancement de la plateforme d\'apprentissage en ligne',
        ar: 'إطلاق منصة التعلم عبر الإنترنت'
      }
    }
  ];

  // Use CMS timeline if available
  const timeline = aboutContent?.history?.milestones?.length > 0
    ? aboutContent.history.milestones
    : defaultTimeline;

  if (loading) {
    return (
      <SharedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block mb-6">
              <SparklesIcon className="w-16 h-16 mx-auto animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up">
              {isArabic ? content.title.ar : content.title.fr}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-fade-in-up animation-delay-200">
              {isArabic ? content.subtitle.ar : content.subtitle.fr}
            </p>
            <p className="text-lg leading-relaxed text-white/90 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
              {isArabic ? content.description.ar : content.description.fr}
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'قيمنا' : 'Nos Valeurs'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {isArabic 
                ? 'القيم الأساسية التي توجه رسالتنا التعليمية وتشكل مجتمعنا المدرسي'
                : 'Les valeurs fondamentales qui guident notre mission éducative et façonnent notre communauté scolaire'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div 
                key={index} 
                className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {isArabic ? value.title.ar : value.title.fr}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {isArabic ? value.description.ar : value.description.fr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Timeline */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'تاريخنا' : 'Notre Histoire'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {isArabic ? 'رحلة التميز والإنجازات' : 'Un parcours d\'excellence et de réalisations'}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-600 to-violet-600"></div>

              {timeline.map((event, index) => (
                <div key={index} className={`relative mb-12 ${index % 2 === 0 ? 'md:pr-1/2 md:text-right' : 'md:pl-1/2 md:ml-auto'}`}>
                  <div className="md:w-1/2">
                    {/* Timeline dot */}
                    <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-blue-600 rounded-full transform -translate-x-1/2 ring-4 ring-white dark:ring-gray-800"></div>
                    
                    <div className={`ml-16 md:ml-0 ${index % 2 === 0 ? 'md:mr-16' : 'md:ml-16'}`}>
                      <div className="bg-gradient-to-br from-blue-50 to-violet-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                          {event.year}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {isArabic ? event.title.ar : event.title.fr}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {isArabic ? event.description.ar : event.description.fr}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'مرافقنا' : 'Nos Installations'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {isArabic ? 'بيئة تعليمية حديثة ومجهزة بالكامل' : 'Un environnement d\'apprentissage moderne et entièrement équipé'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {facilities.map((facility, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl mb-4">
                  <facility.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {isArabic ? facility.title.ar : facility.title.fr}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic ? facility.description.ar : facility.description.fr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
