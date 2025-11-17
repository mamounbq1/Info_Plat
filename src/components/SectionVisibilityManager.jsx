import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  EyeIcon, 
  EyeSlashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

/**
 * SectionVisibilityManager Component
 * 
 * Manages visibility and order of all landing page sections
 * Admin can enable/disable sections and reorder them
 */
export default function SectionVisibilityManager({ isArabic }) {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([
    { id: 'hero', nameFr: 'Hero Section', nameAr: 'القسم الرئيسي', enabled: true, order: 1 },
    { id: 'news-ticker', nameFr: 'Barre Défilante Actualités', nameAr: 'شريط الأخبار المتحرك', enabled: true, order: 2 },
    { id: 'stats', nameFr: 'Statistiques', nameAr: 'الإحصائيات', enabled: true, order: 3 },
    { id: 'about', nameFr: 'À Propos', nameAr: 'عن الثانوية', enabled: true, order: 4 },
    { id: 'news', nameFr: 'Actualités', nameAr: 'الأخبار', enabled: true, order: 5 },
    { id: 'announcements', nameFr: 'Section Annonces', nameAr: 'قسم الإعلانات', enabled: true, order: 6 },
    { id: 'events', nameFr: 'Section Événements', nameAr: 'قسم الأحداث', enabled: true, order: 7 },
    { id: 'clubs', nameFr: 'Clubs & Activités', nameAr: 'الأندية والأنشطة', enabled: true, order: 8 },
    { id: 'gallery', nameFr: 'Galerie Photos', nameAr: 'معرض الصور', enabled: true, order: 9 },
    { id: 'testimonials', nameFr: 'Témoignages', nameAr: 'الشهادات', enabled: true, order: 10 },
    { id: 'quicklinks', nameFr: 'Liens Rapides', nameAr: 'روابط سريعة', enabled: true, order: 11 },
    { id: 'contact', nameFr: 'Contact', nameAr: 'اتصل بنا', enabled: true, order: 12 },
  ]);

  useEffect(() => {
    fetchSectionSettings();
  }, []);

  const fetchSectionSettings = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'homepage', 'section-visibility');
      const docSnap = await getDoc(docRef);
      
      // Default sections template
      const defaultSections = [
        { id: 'hero', nameFr: 'Hero Section', nameAr: 'القسم الرئيسي', enabled: true, order: 1 },
        { id: 'news-ticker', nameFr: 'Barre Défilante Actualités', nameAr: 'شريط الأخبار المتحرك', enabled: true, order: 2 },
        { id: 'stats', nameFr: 'Statistiques', nameAr: 'الإحصائيات', enabled: true, order: 3 },
        { id: 'about', nameFr: 'À Propos', nameAr: 'عن الثانوية', enabled: true, order: 4 },
        { id: 'news', nameFr: 'Actualités', nameAr: 'الأخبار', enabled: true, order: 5 },
        { id: 'announcements', nameFr: 'Section Annonces', nameAr: 'قسم الإعلانات', enabled: true, order: 6 },
        { id: 'events', nameFr: 'Section Événements', nameAr: 'قسم الأحداث', enabled: true, order: 7 },
        { id: 'clubs', nameFr: 'Clubs & Activités', nameAr: 'الأندية والأنشطة', enabled: true, order: 8 },
        { id: 'gallery', nameFr: 'Galerie Photos', nameAr: 'معرض الصور', enabled: true, order: 9 },
        { id: 'testimonials', nameFr: 'Témoignages', nameAr: 'الشهادات', enabled: true, order: 10 },
        { id: 'quicklinks', nameFr: 'Liens Rapides', nameAr: 'روابط سريعة', enabled: true, order: 10 },
        { id: 'contact', nameFr: 'Contact', nameAr: 'اتصل بنا', enabled: true, order: 11 },
      ];
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.sections && Array.isArray(data.sections)) {
          // Merge: Keep existing sections but add any new ones from defaults
          const existingSectionIds = data.sections.map(s => s.id);
          const mergedSections = [...data.sections];
          
          // Add new sections that don't exist yet
          defaultSections.forEach(defaultSection => {
            if (!existingSectionIds.includes(defaultSection.id)) {
              console.log(`➕ Adding new section: ${defaultSection.id}`);
              mergedSections.push(defaultSection);
            }
          });
          
          // Sort by order
          mergedSections.sort((a, b) => a.order - b.order);
          
          setSections(mergedSections);
          return;
        }
      }
      
      // If no data exists, use defaults
      setSections(defaultSections);
    } catch (error) {
      console.error('Error fetching section settings:', error);
      toast.error(isArabic ? 'خطأ في تحميل الإعدادات' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await setDoc(doc(db, 'homepage', 'section-visibility'), {
        sections: sections,
        updatedAt: new Date().toISOString()
      });
      toast.success(isArabic ? 'تم حفظ الإعدادات' : 'Paramètres sauvegardés');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, enabled: !section.enabled } : section
    ));
  };

  const moveSection = (index, direction) => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    // Update order values
    newSections.forEach((section, idx) => {
      section.order = idx + 1;
    });
    
    setSections(newSections);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Cog6ToothIcon className="w-7 h-7" />
            {isArabic ? 'إدارة رؤية الأقسام' : 'Gestion de la Visibilité des Sections'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {isArabic 
              ? 'قم بتفعيل أو تعطيل أقسام الصفحة الرئيسية وإعادة ترتيبها' 
              : 'Activez/Désactivez et réorganisez les sections de la page d\'accueil'}
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            isArabic ? 'جاري الحفظ...' : 'Sauvegarde...'
          ) : (
            <>
              <Cog6ToothIcon className="w-5 h-5" />
              {isArabic ? 'حفظ الإعدادات' : 'Sauvegarder'}
            </>
          )}
        </button>
      </div>

      <div className="space-y-3">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition ${
              section.enabled
                ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
            }`}
          >
            {/* Order Number */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => moveSection(index, 'up')}
                disabled={index === 0}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title={isArabic ? 'نقل للأعلى' : 'Déplacer vers le haut'}
              >
                <ArrowUpIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                {section.order}
              </span>
              <button
                onClick={() => moveSection(index, 'down')}
                disabled={index === sections.length - 1}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                title={isArabic ? 'نقل للأسفل' : 'Déplacer vers le bas'}
              >
                <ArrowDownIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Section Info */}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {isArabic ? section.nameAr : section.nameFr}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID: {section.id}
              </p>
            </div>

            {/* Status Badge */}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              section.enabled 
                ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
            }`}>
              {section.enabled 
                ? (isArabic ? 'مفعل' : 'Activé')
                : (isArabic ? 'معطل' : 'Désactivé')
              }
            </span>

            {/* Toggle Button */}
            <button
              onClick={() => toggleSection(section.id)}
              className={`p-2 rounded-lg transition ${
                section.enabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
              title={section.enabled 
                ? (isArabic ? 'تعطيل' : 'Désactiver')
                : (isArabic ? 'تفعيل' : 'Activer')
              }
            >
              {section.enabled ? (
                <EyeIcon className="w-5 h-5" />
              ) : (
                <EyeSlashIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
          {isArabic ? '💡 نصائح' : '💡 Conseils'}
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• {isArabic ? 'استخدم الأسهم لإعادة ترتيب الأقسام' : 'Utilisez les flèches pour réorganiser les sections'}</li>
          <li>• {isArabic ? 'انقر على أيقونة العين لتفعيل/تعطيل قسم' : 'Cliquez sur l\'icône œil pour activer/désactiver une section'}</li>
          <li>• {isArabic ? 'يمكنك تعطيل أي قسم مؤقتاً دون حذف محتواه' : 'Vous pouvez désactiver temporairement une section sans supprimer son contenu'}</li>
          <li>• {isArabic ? 'لا تنسى الضغط على "حفظ الإعدادات" بعد التعديل' : 'N\'oubliez pas de cliquer sur "Sauvegarder" après modification'}</li>
        </ul>
      </div>
    </div>
  );
}
