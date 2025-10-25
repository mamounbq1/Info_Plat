import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  DocumentTextIcon,
  PencilSquareIcon,
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { db } from '../config/firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import AboutPageEditor from './pageEditors/AboutPageEditor';
import GenericPageEditor from './pageEditors/GenericPageEditor';


export default function PageManager() {
  const { isArabic } = useLanguage();
  const [selectedPage, setSelectedPage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pages éditables disponibles
  const allPages = [
    { id: 'about', name: 'À Propos', nameAr: 'من نحن', route: '/about', category: 'public', editor: 'about', icon: '📋', description: 'Présentation de l\'établissement' },
    { id: 'privacy', name: 'Politique de Confidentialité', nameAr: 'سياسة الخصوصية', route: '/privacy', category: 'legal', editor: 'generic', icon: '🔒', description: 'Protection des données' },
    { id: 'terms', name: 'Conditions d\'Utilisation', nameAr: 'شروط الاستخدام', route: '/terms', category: 'legal', editor: 'generic', icon: '📄', description: 'Règles d\'utilisation' },
  ];

  const categories = [
    { id: 'all', name: 'Toutes', nameAr: 'الكل', icon: '📄' },
    { id: 'public', name: 'Pages Publiques', nameAr: 'الصفحات العامة', icon: '🌐' },
    { id: 'legal', name: 'Pages Légales', nameAr: 'الصفحات القانونية', icon: '⚖️' },
  ];

  useEffect(() => {
    loadPagesStatus();
  }, []);

  const loadPagesStatus = async () => {
    setLoading(true);
    try {
      const pagesData = await Promise.all(
        allPages.map(async (page) => {
          const docRef = doc(db, 'pageContents', page.id);
          const docSnap = await getDoc(docRef);
          
          return {
            ...page,
            hasContent: docSnap.exists(),
            lastModified: docSnap.exists() ? docSnap.data().lastModified?.toDate() : null,
            status: docSnap.exists() ? 'published' : 'draft',
          };
        })
      );
      setPages(pagesData);
    } catch (error) {
      console.error('Error loading pages status:', error);
      setPages(allPages.map(page => ({ ...page, hasContent: false, status: 'draft' })));
    } finally {
      setLoading(false);
    }
  };

  const filteredPages = pages.filter(page => {
    const matchesSearch = page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         page.nameAr.includes(searchTerm) ||
                         page.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || page.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePageSelect = (page) => {
    setSelectedPage(page);
  };

  const handleBackToList = () => {
    setSelectedPage(null);
    loadPagesStatus(); // Reload to get updated status
  };

  const renderEditor = () => {
    if (!selectedPage) return null;

    const editorProps = {
      pageId: selectedPage.id,
      onBack: handleBackToList,
    };

    switch (selectedPage.editor) {
      case 'about':
        return <AboutPageEditor {...editorProps} />;
      case 'generic':
      default:
        return <GenericPageEditor {...editorProps} pageName={selectedPage.name} />;
    }
  };

  if (selectedPage) {
    return renderEditor();
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'إدارة الصفحات' : 'Gestion des Pages'}
        </h2>
      </div>

      {/* Pages Grid */}
      <div className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {isArabic ? 'جاري التحميل...' : 'Chargement...'}
            </p>
          </div>
        ) : filteredPages.length === 0 ? (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {isArabic ? 'لم يتم العثور على صفحات' : 'Aucune page trouvée'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                onClick={() => handlePageSelect(page)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 
                         hover:border-purple-500 dark:hover:border-purple-400 
                         hover:shadow-lg transition-all cursor-pointer group
                         bg-white dark:bg-gray-800"
              >
                {/* Page Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{page.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {isArabic ? page.nameAr : page.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {page.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                        {page.route}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-transform group-hover:translate-x-1" />
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    page.hasContent
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>
                    {page.hasContent ? (
                      <>
                        <CheckCircleIcon className="w-3 h-3" />
                        {isArabic ? 'منشورة' : 'Publiée'}
                      </>
                    ) : (
                      <>
                        <ClockIcon className="w-3 h-3" />
                        {isArabic ? 'مسودة' : 'Brouillon'}
                      </>
                    )}
                  </span>

                  {page.lastModified && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(page.lastModified).toLocaleDateString(isArabic ? 'ar-MA' : 'fr-FR')}
                    </span>
                  )}
                </div>

                {/* Action Icons */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm 
                                   bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 
                                   rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition">
                    <PencilSquareIcon className="w-4 h-4" />
                    {isArabic ? 'تحرير' : 'Modifier'}
                  </button>
                  <button className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 
                                   text-gray-700 dark:text-gray-300 rounded-lg 
                                   hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
