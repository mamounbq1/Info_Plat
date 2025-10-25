import { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  ArrowLeftIcon,
  CheckCircleIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function AboutPageEditor({ pageId, onBack }) {
  const { isArabic } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [content, setContent] = useState({
    hero: {
      title: { fr: '', ar: '' },
      subtitle: { fr: '', ar: '' },
    },
    mission: {
      title: { fr: '', ar: '' },
      content: { fr: '', ar: '' },
    },
    vision: {
      title: { fr: '', ar: '' },
      content: { fr: '', ar: '' },
    },
    values: {
      title: { fr: '', ar: '' },
      items: [],
    },
    history: {
      title: { fr: '', ar: '' },
      content: { fr: '', ar: '' },
      milestones: [],
    },
    facilities: {
      title: { fr: '', ar: '' },
      items: [],
    },
    team: {
      title: { fr: '', ar: '' },
      members: [],
    },
    isPublished: true,
  });

  useEffect(() => {
    console.log('🚀 [AboutPageEditor] Component mounted, loading content...');
    loadPageContent();
  }, []);

  useEffect(() => {
    console.log('🔄 [AboutPageEditor] Content state changed:', {
      hasContent: !!content,
      heroTitle: content?.hero?.title,
      missionTitle: content?.mission?.title,
      valuesCount: content?.values?.items?.length,
      milestonesCount: content?.history?.milestones?.length,
      facilitiesCount: content?.facilities?.items?.length
    });
  }, [content]);

  const loadPageContent = async () => {
    console.log('🔍 [AboutPageEditor] Loading page content for pageId:', pageId);
    setLoading(true);
    try {
      const docRef = doc(db, 'pageContents', pageId);
      console.log('📄 [AboutPageEditor] Fetching from Firestore path:', `pageContents/${pageId}`);
      const docSnap = await getDoc(docRef);
      
      console.log('✅ [AboutPageEditor] Document exists?', docSnap.exists());
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('📦 [AboutPageEditor] Loaded data from Firebase:', data);
        setContent(data);
      } else {
        console.log('⚠️ [AboutPageEditor] No document found, initializing with default content');
        // Initialize with default content from AboutPage.jsx
        const defaultAboutContent = {
          hero: {
            title: { 
              fr: 'À Propos de Lycée Excellence', 
              ar: 'حول ثانوية التميز' 
            },
            subtitle: { 
              fr: 'Un établissement d\'excellence dédié à la réussite de chaque élève',
              ar: 'مؤسسة تعليمية متميزة مكرسة لنجاح كل طالب'
            },
          },
          mission: {
            title: { 
              fr: 'Notre Mission', 
              ar: 'مهمتنا' 
            },
            content: { 
              fr: 'Depuis sa création, le Lycée Excellence s\'est imposé comme l\'un des établissements d\'enseignement secondaire les plus prestigieux du Maroc. Notre mission est de fournir une éducation de qualité supérieure qui prépare nos élèves à devenir des citoyens responsables et des leaders de demain.',
              ar: 'منذ تأسيسها، أصبحت ثانوية التميز واحدة من أرقى مؤسسات التعليم الثانوي في المغرب. مهمتنا هي توفير تعليم عالي الجودة يعد طلابنا ليصبحوا مواطنين مسؤولين وقادة الغد.'
            },
          },
          vision: {
            title: { 
              fr: 'Notre Vision', 
              ar: 'رؤيتنا' 
            },
            content: { 
              fr: 'Être un établissement d\'excellence reconnu pour la qualité de son enseignement et le développement holistique de ses élèves.',
              ar: 'أن نكون مؤسسة تعليمية متميزة معترف بها لجودة تعليمها والتطوير الشامل لطلابها.'
            },
          },
          values: {
            title: { 
              fr: 'Nos Valeurs', 
              ar: 'قيمنا' 
            },
            items: [
              {
                id: '1',
                title: { fr: 'Excellence Académique', ar: 'التميز الأكاديمي' },
                description: { 
                  fr: 'Nous visons l\'excellence dans tous les aspects de l\'enseignement et de l\'apprentissage.',
                  ar: 'نسعى للتميز في جميع جوانب التدريس والتعلم.'
                },
                icon: '💡',
              },
              {
                id: '2',
                title: { fr: 'Développement Personnel', ar: 'التطوير الشخصي' },
                description: { 
                  fr: 'Nous soutenons le développement holistique de chaque élève.',
                  ar: 'ندعم التطوير الشامل لكل طالب.'
                },
                icon: '❤️',
              },
              {
                id: '3',
                title: { fr: 'Esprit Communautaire', ar: 'الروح المجتمعية' },
                description: { 
                  fr: 'Nous cultivons un environnement inclusif et bienveillant.',
                  ar: 'نرعى بيئة شاملة ورعاية.'
                },
                icon: '👥',
              },
              {
                id: '4',
                title: { fr: 'Innovation', ar: 'الابتكار' },
                description: { 
                  fr: 'Nous encourageons la créativité et l\'innovation dans l\'apprentissage.',
                  ar: 'نشجع الإبداع والابتكار في التعلم.'
                },
                icon: '🚀',
              },
              {
                id: '5',
                title: { fr: 'Ouverture Internationale', ar: 'الانفتاح الدولي' },
                description: { 
                  fr: 'Nous préparons nos élèves à devenir des citoyens du monde.',
                  ar: 'نعد طلابنا ليصبحوا مواطنين عالميين.'
                },
                icon: '🌍',
              },
              {
                id: '6',
                title: { fr: 'Intégrité', ar: 'النزاهة' },
                description: { 
                  fr: 'Nous promouvons l\'honnêteté, le respect et la responsabilité.',
                  ar: 'نعزز الأمانة والاحترام والمسؤولية.'
                },
                icon: '🛡️',
              },
            ],
          },
          history: {
            title: { 
              fr: 'Notre Histoire', 
              ar: 'تاريخنا' 
            },
            content: { 
              fr: 'Un parcours d\'excellence et de réalisations',
              ar: 'رحلة التميز والإنجازات'
            },
            milestones: [
              {
                id: '1',
                year: '1998',
                title: { fr: 'Fondation', ar: 'التأسيس' },
                description: { 
                  fr: 'Création du Lycée Excellence avec 150 élèves',
                  ar: 'تأسيس ثانوية التميز مع 150 طالب'
                },
              },
              {
                id: '2',
                year: '2005',
                title: { fr: 'Expansion', ar: 'التوسع' },
                description: { 
                  fr: 'Construction du nouveau campus et des laboratoires modernes',
                  ar: 'بناء الحرم الجامعي الجديد والمختبرات الحديثة'
                },
              },
              {
                id: '3',
                year: '2012',
                title: { fr: 'Accréditation Internationale', ar: 'الاعتماد الدولي' },
                description: { 
                  fr: 'Obtention de l\'accréditation internationale IB',
                  ar: 'الحصول على الاعتماد الدولي IB'
                },
              },
              {
                id: '4',
                year: '2020',
                title: { fr: 'Transformation Digitale', ar: 'التحول الرقمي' },
                description: { 
                  fr: 'Lancement de la plateforme d\'apprentissage en ligne',
                  ar: 'إطلاق منصة التعلم عبر الإنترنت'
                },
              },
            ],
          },
          facilities: {
            title: { 
              fr: 'Nos Installations', 
              ar: 'مرافقنا' 
            },
            items: [
              {
                id: '1',
                title: { fr: 'Bibliothèque Moderne', ar: 'مكتبة حديثة' },
                description: { 
                  fr: 'Plus de 15,000 ouvrages et ressources numériques',
                  ar: 'أكثر من 15,000 كتاب وموارد رقمية'
                },
                icon: '📚',
              },
              {
                id: '2',
                title: { fr: 'Laboratoires Scientifiques', ar: 'مختبرات علمية' },
                description: { 
                  fr: 'Équipements de pointe pour physique, chimie et biologie',
                  ar: 'معدات متطورة للفيزياء والكيمياء والبيولوجيا'
                },
                icon: '🧪',
              },
              {
                id: '3',
                title: { fr: 'Salles Multimedia', ar: 'قاعات الوسائط المتعددة' },
                description: { 
                  fr: 'Technologies modernes pour un apprentissage interactif',
                  ar: 'تقنيات حديثة للتعلم التفاعلي'
                },
                icon: '💻',
              },
              {
                id: '4',
                title: { fr: 'Installations Sportives', ar: 'مرافق رياضية' },
                description: { 
                  fr: 'Terrains de sport, gymnase et piscine',
                  ar: 'ملاعب رياضية وصالة رياضية ومسبح'
                },
                icon: '🏆',
              },
            ],
          },
          team: {
            title: { 
              fr: 'Notre Équipe', 
              ar: 'فريقنا' 
            },
            members: [],
          },
          isPublished: false,
        };
        console.log('🎨 [AboutPageEditor] Setting default content:', defaultAboutContent);
        setContent(defaultAboutContent);
        console.log('✅ [AboutPageEditor] Default content set successfully');
        
        // AUTO-SAVE: Upload defaults to Firebase on first load
        try {
          console.log('📤 [AboutPageEditor] Auto-saving default content to Firebase...');
          const docRef = doc(db, 'pageContents', pageId);
          await setDoc(docRef, {
            ...defaultAboutContent,
            lastModified: serverTimestamp(),
            pageId,
          });
          console.log('✅ [AboutPageEditor] Default content auto-saved to Firebase successfully');
        } catch (autoSaveError) {
          console.error('❌ [AboutPageEditor] Failed to auto-save defaults:', autoSaveError);
          console.error('⚠️ [AboutPageEditor] User can manually save using the Save button');
        }
      }
    } catch (error) {
      console.error('❌ [AboutPageEditor] Error loading about page:', error);
      console.error('❌ [AboutPageEditor] Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
    } finally {
      console.log('🏁 [AboutPageEditor] Loading finished, setting loading = false');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const docRef = doc(db, 'pageContents', pageId);
      await setDoc(docRef, {
        ...content,
        lastModified: serverTimestamp(),
        pageId,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      alert(isArabic ? 'تم حفظ التغييرات بنجاح' : 'Modifications enregistrées avec succès');
    } catch (error) {
      console.error('Error saving about page:', error);
      alert(isArabic ? 'خطأ في حفظ التغييرات' : 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const addValue = () => {
    const newValue = {
      id: Date.now().toString(),
      title: { fr: '', ar: '' },
      description: { fr: '', ar: '' },
      icon: '✨',
    };
    setContent({
      ...content,
      values: {
        ...content.values,
        items: [...content.values.items, newValue],
      },
    });
  };

  const updateValue = (id, updates) => {
    setContent({
      ...content,
      values: {
        ...content.values,
        items: content.values.items.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    });
  };

  const deleteValue = (id) => {
    setContent({
      ...content,
      values: {
        ...content.values,
        items: content.values.items.filter(item => item.id !== id),
      },
    });
  };

  const addMilestone = () => {
    const newMilestone = {
      id: Date.now().toString(),
      year: '',
      title: { fr: '', ar: '' },
      description: { fr: '', ar: '' },
    };
    setContent({
      ...content,
      history: {
        ...content.history,
        milestones: [...content.history.milestones, newMilestone],
      },
    });
  };

  const updateMilestone = (id, updates) => {
    setContent({
      ...content,
      history: {
        ...content.history,
        milestones: content.history.milestones.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    });
  };

  const deleteMilestone = (id) => {
    setContent({
      ...content,
      history: {
        ...content.history,
        milestones: content.history.milestones.filter(item => item.id !== id),
      },
    });
  };

  const addFacility = () => {
    const newFacility = {
      id: Date.now().toString(),
      title: { fr: '', ar: '' },
      description: { fr: '', ar: '' },
      icon: '🏫',
    };
    setContent({
      ...content,
      facilities: {
        title: content.facilities?.title || { fr: 'Nos Installations', ar: 'مرافقنا' },
        items: [...(content.facilities?.items || []), newFacility],
      },
    });
  };

  const updateFacility = (id, updates) => {
    setContent({
      ...content,
      facilities: {
        ...content.facilities,
        items: (content.facilities?.items || []).map(item => 
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    });
  };

  const deleteFacility = (id) => {
    setContent({
      ...content,
      facilities: {
        ...content.facilities,
        items: (content.facilities?.items || []).filter(item => item.id !== id),
      },
    });
  };

  const addTeamMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: { fr: '', ar: '' },
      position: { fr: '', ar: '' },
      bio: { fr: '', ar: '' },
      imageUrl: '',
    };
    setContent({
      ...content,
      team: {
        ...content.team,
        members: [...content.team.members, newMember],
      },
    });
  };

  const updateTeamMember = (id, updates) => {
    setContent({
      ...content,
      team: {
        ...content.team,
        members: content.team.members.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ),
      },
    });
  };

  const deleteTeamMember = (id) => {
    setContent({
      ...content,
      team: {
        ...content.team,
        members: content.team.members.filter(item => item.id !== id),
      },
    });
  };

  if (loading) {
    console.log('⏳ [AboutPageEditor] Rendering loading state...');
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {isArabic ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  console.log('🎨 [AboutPageEditor] Rendering editor with content:', {
    hero: content.hero,
    mission: content.mission,
    valuesCount: content.values?.items?.length,
    milestonesCount: content.history?.milestones?.length
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 transition"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>{isArabic ? 'رجوع' : 'Retour'}</span>
          </button>
          
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircleIcon className="w-5 h-5" />
                {isArabic ? 'تم الحفظ' : 'Enregistré'}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 
                       disabled:opacity-50 transition"
            >
              {saving ? (isArabic ? 'جاري الحفظ...' : 'Enregistrement...') : (isArabic ? 'حفظ' : 'Enregistrer')}
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'تحرير صفحة: من نحن' : 'Modifier la page: À Propos'}
        </h2>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
        {/* Hero Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            🎯 {isArabic ? 'قسم البطل' : 'Section Hero'}
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
                </label>
                <input
                  type="text"
                  value={content.hero?.title?.fr || ''}
                  onChange={(e) => {
                    console.log('✏️ [AboutPageEditor] Editing Hero Title FR:', e.target.value);
                    setContent({
                      ...content,
                      hero: { ...content.hero, title: { ...content.hero.title, fr: e.target.value } }
                    });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="À Propos de Lycée Excellence"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
                </label>
                <input
                  type="text"
                  value={content.hero.title.ar}
                  onChange={(e) => setContent({
                    ...content,
                    hero: { ...content.hero, title: { ...content.hero.title, ar: e.target.value } }
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isArabic ? 'العنوان الفرعي (فرنسي)' : 'Sous-titre (Français)'}
                </label>
                <textarea
                  value={content.hero.subtitle.fr}
                  onChange={(e) => setContent({
                    ...content,
                    hero: { ...content.hero, subtitle: { ...content.hero.subtitle, fr: e.target.value } }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  {isArabic ? 'العنوان الفرعي (عربي)' : 'Sous-titre (Arabe)'}
                </label>
                <textarea
                  value={content.hero.subtitle.ar}
                  onChange={(e) => setContent({
                    ...content,
                    hero: { ...content.hero, subtitle: { ...content.hero.subtitle, ar: e.target.value } }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 text-right"
                />
              </div>
            </div>


          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Mission */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold mb-4">🎯 {isArabic ? 'المهمة' : 'Mission'}</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={content.mission.title.fr}
                onChange={(e) => setContent({
                  ...content,
                  mission: { ...content.mission, title: { ...content.mission.title, fr: e.target.value } }
                })}
                placeholder="Titre (Français)"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                value={content.mission.title.ar}
                onChange={(e) => setContent({
                  ...content,
                  mission: { ...content.mission, title: { ...content.mission.title, ar: e.target.value } }
                })}
                placeholder="العنوان (عربي)"
                className="w-full px-3 py-2 border rounded-lg text-sm text-right"
              />
              <textarea
                value={content.mission.content.fr}
                onChange={(e) => setContent({
                  ...content,
                  mission: { ...content.mission, content: { ...content.mission.content, fr: e.target.value } }
                })}
                placeholder="Contenu (Français)"
                rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <textarea
                value={content.mission.content.ar}
                onChange={(e) => setContent({
                  ...content,
                  mission: { ...content.mission, content: { ...content.mission.content, ar: e.target.value } }
                })}
                placeholder="المحتوى (عربي)"
                rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm text-right"
              />
            </div>
          </div>

          {/* Vision */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <h3 className="text-lg font-semibold mb-4">🔮 {isArabic ? 'الرؤية' : 'Vision'}</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={content.vision.title.fr}
                onChange={(e) => setContent({
                  ...content,
                  vision: { ...content.vision, title: { ...content.vision.title, fr: e.target.value } }
                })}
                placeholder="Titre (Français)"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                value={content.vision.title.ar}
                onChange={(e) => setContent({
                  ...content,
                  vision: { ...content.vision, title: { ...content.vision.title, ar: e.target.value } }
                })}
                placeholder="العنوان (عربي)"
                className="w-full px-3 py-2 border rounded-lg text-sm text-right"
              />
              <textarea
                value={content.vision.content.fr}
                onChange={(e) => setContent({
                  ...content,
                  vision: { ...content.vision, content: { ...content.vision.content, fr: e.target.value } }
                })}
                placeholder="Contenu (Français)"
                rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
              <textarea
                value={content.vision.content.ar}
                onChange={(e) => setContent({
                  ...content,
                  vision: { ...content.vision, content: { ...content.vision.content, ar: e.target.value } }
                })}
                placeholder="المحتوى (عربي)"
                rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm text-right"
              />
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">⭐ {isArabic ? 'القيم' : 'Valeurs'}</h3>
            <button
              onClick={addValue}
              className="px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              {isArabic ? 'إضافة' : 'Ajouter'}
            </button>
          </div>

          <div className="space-y-3">
            {content.values.items.map((value) => (
              <div key={value.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="text"
                    value={value.icon}
                    onChange={(e) => updateValue(value.id, { icon: e.target.value })}
                    className="w-16 px-2 py-1 border rounded text-center"
                    placeholder="🎯"
                  />
                  <button
                    onClick={() => deleteValue(value.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={value.title.fr}
                    onChange={(e) => updateValue(value.id, { title: { ...value.title, fr: e.target.value } })}
                    placeholder="Titre (FR)"
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="text"
                    value={value.title.ar}
                    onChange={(e) => updateValue(value.id, { title: { ...value.title, ar: e.target.value } })}
                    placeholder="العنوان"
                    className="px-2 py-1 border rounded text-sm text-right"
                  />
                  <textarea
                    value={value.description.fr}
                    onChange={(e) => updateValue(value.id, { description: { ...value.description, fr: e.target.value } })}
                    placeholder="Description (FR)"
                    rows={2}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <textarea
                    value={value.description.ar}
                    onChange={(e) => updateValue(value.id, { description: { ...value.description, ar: e.target.value } })}
                    placeholder="الوصف"
                    rows={2}
                    className="px-2 py-1 border rounded text-sm text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History / Timeline */}
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📅 {isArabic ? 'التاريخ' : 'Histoire'}</h3>
            <button
              onClick={addMilestone}
              className="px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              {isArabic ? 'إضافة معلم' : 'Ajouter Jalon'}
            </button>
          </div>

          {/* History Title & Content */}
          <div className="mb-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={content.history?.title?.fr || ''}
                onChange={(e) => setContent({
                  ...content,
                  history: { ...content.history, title: { ...content.history.title, fr: e.target.value } }
                })}
                placeholder="Titre (Français)"
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <input
                type="text"
                value={content.history?.title?.ar || ''}
                onChange={(e) => setContent({
                  ...content,
                  history: { ...content.history, title: { ...content.history.title, ar: e.target.value } }
                })}
                placeholder="العنوان (عربي)"
                className="px-3 py-2 border rounded-lg text-sm text-right"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <textarea
                value={content.history?.content?.fr || ''}
                onChange={(e) => setContent({
                  ...content,
                  history: { ...content.history, content: { ...content.history.content, fr: e.target.value } }
                })}
                placeholder="Description (Français)"
                rows={2}
                className="px-3 py-2 border rounded-lg text-sm"
              />
              <textarea
                value={content.history?.content?.ar || ''}
                onChange={(e) => setContent({
                  ...content,
                  history: { ...content.history, content: { ...content.history.content, ar: e.target.value } }
                })}
                placeholder="الوصف (عربي)"
                rows={2}
                className="px-3 py-2 border rounded-lg text-sm text-right"
              />
            </div>
          </div>

          {/* Milestones List */}
          <div className="space-y-3">
            {content.history?.milestones?.map((milestone) => (
              <div key={milestone.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="text"
                    value={milestone.year}
                    onChange={(e) => updateMilestone(milestone.id, { year: e.target.value })}
                    className="w-24 px-2 py-1 border rounded text-center font-bold"
                    placeholder="2020"
                  />
                  <button
                    onClick={() => deleteMilestone(milestone.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={milestone.title.fr}
                    onChange={(e) => updateMilestone(milestone.id, { title: { ...milestone.title, fr: e.target.value } })}
                    placeholder="Titre (FR)"
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="text"
                    value={milestone.title.ar}
                    onChange={(e) => updateMilestone(milestone.id, { title: { ...milestone.title, ar: e.target.value } })}
                    placeholder="العنوان"
                    className="px-2 py-1 border rounded text-sm text-right"
                  />
                  <textarea
                    value={milestone.description.fr}
                    onChange={(e) => updateMilestone(milestone.id, { description: { ...milestone.description, fr: e.target.value } })}
                    placeholder="Description (FR)"
                    rows={2}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <textarea
                    value={milestone.description.ar}
                    onChange={(e) => updateMilestone(milestone.id, { description: { ...milestone.description, ar: e.target.value } })}
                    placeholder="الوصف"
                    rows={2}
                    className="px-2 py-1 border rounded text-sm text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Facilities / Installations */}
        <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">🏫 {isArabic ? 'المرافق' : 'Installations'}</h3>
            <button
              onClick={addFacility}
              className="px-3 py-1 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 text-sm flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              {isArabic ? 'إضافة' : 'Ajouter'}
            </button>
          </div>

          {/* Facilities Title */}
          <div className="mb-4 grid grid-cols-2 gap-2">
            <input
              type="text"
              value={content.facilities?.title?.fr || ''}
              onChange={(e) => setContent({
                ...content,
                facilities: { 
                  ...content.facilities, 
                  title: { 
                    ...(content.facilities?.title || { fr: '', ar: '' }), 
                    fr: e.target.value 
                  } 
                }
              })}
              placeholder="Titre Section (Français)"
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              value={content.facilities?.title?.ar || ''}
              onChange={(e) => setContent({
                ...content,
                facilities: { 
                  ...content.facilities, 
                  title: { 
                    ...(content.facilities?.title || { fr: '', ar: '' }), 
                    ar: e.target.value 
                  } 
                }
              })}
              placeholder="عنوان القسم (عربي)"
              className="px-3 py-2 border rounded-lg text-sm text-right"
            />
          </div>

          {/* Facilities List */}
          <div className="space-y-3">
            {content.facilities?.items?.map((facility) => (
              <div key={facility.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border">
                <div className="flex justify-between items-start mb-2">
                  <input
                    type="text"
                    value={facility.icon}
                    onChange={(e) => updateFacility(facility.id, { icon: e.target.value })}
                    className="w-16 px-2 py-1 border rounded text-center"
                    placeholder="🏫"
                  />
                  <button
                    onClick={() => deleteFacility(facility.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={facility.title.fr}
                    onChange={(e) => updateFacility(facility.id, { title: { ...facility.title, fr: e.target.value } })}
                    placeholder="Titre (FR)"
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <input
                    type="text"
                    value={facility.title.ar}
                    onChange={(e) => updateFacility(facility.id, { title: { ...facility.title, ar: e.target.value } })}
                    placeholder="العنوان"
                    className="px-2 py-1 border rounded text-sm text-right"
                  />
                  <textarea
                    value={facility.description.fr}
                    onChange={(e) => updateFacility(facility.id, { description: { ...facility.description, fr: e.target.value } })}
                    placeholder="Description (FR)"
                    rows={2}
                    className="px-2 py-1 border rounded text-sm"
                  />
                  <textarea
                    value={facility.description.ar}
                    onChange={(e) => updateFacility(facility.id, { description: { ...facility.description, ar: e.target.value } })}
                    placeholder="الوصف"
                    rows={2}
                    className="px-2 py-1 border rounded text-sm text-right"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Publish Toggle */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={content.isPublished}
              onChange={(e) => setContent({ ...content, isPublished: e.target.checked })}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <span className="font-medium">
              {isArabic ? 'نشر هذه الصفحة' : 'Publier cette page'}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
