import { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, addDoc, getDocs, deleteDoc, query, orderBy, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useLanguage } from '../contexts/LanguageContext';
import { uploadImage } from '../utils/fileUpload';
import ImageUploadField from './ImageUploadField';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  PhotoIcon,
  NewspaperIcon,
  MegaphoneIcon,
  StarIcon,
  ChartBarIcon,
  UserGroupIcon,
  LinkIcon,
  PhoneIcon,
  CheckCircleIcon,
  CalendarIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { NEWS_CATEGORIES } from '../constants/newsCategories';

// ✨ NOUVEAU: Import des 7 nouveaux composants CMS modulaires
import AnnouncementsManager from './cms/AnnouncementsManager';
import EventsManager from './cms/EventsManager';
import ClubsManager from './cms/ClubsManager';
import GalleryManager from './cms/GalleryManager';
import QuickLinksManager from './cms/QuickLinksManager';
import ContactManager from './cms/ContactManager';
import AboutManager from './cms/AboutManager';
import FooterManager from './cms/FooterManager';

// ✨ NEW: Hero Section Editor with Image Upload
import HeroSectionEditor from './cms/HeroSectionEditor';

export default function HomeContentManager() {
  const { isArabic } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('hero'); // hero, features, news, testimonials, stats, etc.
  
  // Hero Section State
  const [heroContent, setHeroContent] = useState({
    titleFr: '',
    titleAr: '',
    subtitleFr: '',
    subtitleAr: '',
    descriptionFr: '',
    descriptionAr: '',
    badgeFr: '',
    badgeAr: '',
    primaryButtonTextFr: '',
    primaryButtonTextAr: '',
    secondaryButtonTextFr: '',
    secondaryButtonTextAr: '',
    // Background settings
    backgroundType: 'gradient', // 'gradient', 'image', 'carousel'
    gradientColors: {
      from: 'blue-600',
      via: 'violet-600',
      to: 'purple-700'
    },
    backgroundImages: [], // Array of uploaded images for carousel or single image
    carouselInterval: 5000, // Carousel auto-play interval in ms
    enabled: true
  });

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingTestimonialAvatar, setUploadingTestimonialAvatar] = useState(false);

  // Features State
  const [features, setFeatures] = useState([]);
  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [featureForm, setFeatureForm] = useState({
    titleFr: '',
    titleAr: '',
    descriptionFr: '',
    descriptionAr: '',
    icon: 'BookOpenIcon',
    order: 0,
    enabled: true
  });

  // News/Announcements State
  const [news, setNews] = useState([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [newsForm, setNewsForm] = useState({
    titleFr: '',
    titleAr: '',
    excerptFr: '',
    excerptAr: '',
    contentFr: '',
    contentAr: '',
    dateFr: '',
    dateAr: '',
    image: '',
    category: 'Actualités',
    enabled: true,
    publishDate: new Date().toISOString().split('T')[0]
  });

  // Testimonials State
  const [testimonials, setTestimonials] = useState([]);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [testimonialForm, setTestimonialForm] = useState({
    nameFr: '',
    nameAr: '',
    roleFr: '',
    roleAr: '',
    contentFr: '',
    contentAr: '',
    avatarUrl: '',
    rating: 5,
    enabled: true
  });

  // Statistics State
  const [stats, setStats] = useState({
    students: { valueFr: '1000+', valueAr: '1000+', labelFr: 'Étudiants', labelAr: 'طلاب' },
    administrativeStaff: { valueFr: '15+', valueAr: '15+', labelFr: 'Staff Administratif', labelAr: 'الموظفون الإداريون' },
    teachers: { valueFr: '20+', valueAr: '20+', labelFr: 'Enseignants', labelAr: 'معلمين' },
    satisfaction: { valueFr: '95%', valueAr: '95%', labelFr: 'Satisfaction', labelAr: 'رضا' }
  });

  const iconOptions = [
    'BookOpenIcon',
    'AcademicCapIcon',
    'ClipboardDocumentCheckIcon',
    'UserGroupIcon',
    'ChartBarIcon',
    'CpuChipIcon',
    'GlobeAltIcon',
    'LightBulbIcon',
    'RocketLaunchIcon',
    'SparklesIcon'
  ];

  useEffect(() => {
    fetchAllContent();
  }, []);

  const fetchAllContent = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchHeroContent(),
        fetchFeatures(),
        fetchNews(),
        fetchTestimonials(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error(isArabic ? 'خطأ في تحميل المحتوى' : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  const fetchHeroContent = async () => {
    try {
      const docRef = doc(db, 'homepage', 'hero');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert nested structure to flat structure for form
        setHeroContent({
          titleFr: data.title?.fr || '',
          titleAr: data.title?.ar || '',
          subtitleFr: data.subtitle?.fr || '',
          subtitleAr: data.subtitle?.ar || '',
          descriptionFr: data.description?.fr || '',
          descriptionAr: data.description?.ar || '',
          badgeFr: data.badge?.fr || '',
          badgeAr: data.badge?.ar || '',
          primaryButtonTextFr: data.primaryButtonText?.fr || '',
          primaryButtonTextAr: data.primaryButtonText?.ar || '',
          secondaryButtonTextFr: data.secondaryButtonText?.fr || '',
          secondaryButtonTextAr: data.secondaryButtonText?.ar || '',
          // Background settings
          backgroundType: data.backgroundType || 'gradient',
          gradientColors: data.gradientColors || {
            from: 'blue-600',
            via: 'violet-600',
            to: 'purple-700'
          },
          backgroundImages: data.backgroundImages || [],
          carouselInterval: data.carouselInterval || 5000,
          enabled: data.enabled !== undefined ? data.enabled : true
        });
      }
    } catch (error) {
      console.error('Error fetching hero:', error);
    }
  };

  const fetchFeatures = async () => {
    try {
      const q = query(collection(db, 'homepage-features'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      const featuresData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeatures(featuresData);
    } catch (error) {
      console.error('Error fetching features:', error);
    }
  };

  const fetchNews = async () => {
    try {
      const q = query(collection(db, 'homepage-news'), orderBy('publishDate', 'desc'));
      const snapshot = await getDocs(q);
      const newsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNews(newsData);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const q = query(collection(db, 'homepage-testimonials'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const testimonialsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTestimonials(testimonialsData);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const docRef = doc(db, 'homepage', 'stats');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Convert stats0, stats1, stats2, stats3 format to named format for editing
        setStats({
          students: { 
            valueFr: data.stats0?.value || '1000+', 
            valueAr: data.stats0?.value || '1000+', 
            labelFr: data.stats0?.labelFr || 'Étudiants', 
            labelAr: data.stats0?.labelAr || 'طلاب' 
          },
          administrativeStaff: { 
            valueFr: data.stats1?.value || '15+', 
            valueAr: data.stats1?.value || '15+', 
            labelFr: data.stats1?.labelFr || 'Staff Administratif', 
            labelAr: data.stats1?.labelAr || 'الموظفون الإداريون' 
          },
          teachers: { 
            valueFr: data.stats2?.value || '20+', 
            valueAr: data.stats2?.value || '20+', 
            labelFr: data.stats2?.labelFr || 'Enseignants', 
            labelAr: data.stats2?.labelAr || 'معلمين' 
          },
          satisfaction: { 
            valueFr: data.stats3?.value || '95%', 
            valueAr: data.stats3?.value || '95%', 
            labelFr: data.stats3?.labelFr || 'Satisfaction', 
            labelAr: data.stats3?.labelAr || 'رضا' 
          }
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Image Upload Functions for Hero Section
  const handleImageUpload = async (file) => {
    if (!file) return null;

    try {
      setUploadingImage(true);
      // Create unique filename
      const timestamp = Date.now();
      const filename = `hero-images/${timestamp}-${file.name}`;
      const storageRef = ref(storage, filename);

      // Upload file
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image téléchargée avec succès');
      return {
        url: downloadURL,
        path: filename,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(isArabic ? 'خطأ في رفع الصورة' : 'Erreur de téléchargement');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async (imagePath) => {
    try {
      if (imagePath) {
        const storageRef = ref(storage, imagePath);
        await deleteObject(storageRef);
        toast.success(isArabic ? 'تم حذف الصورة' : 'Image supprimée');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(isArabic ? 'خطأ في حذف الصورة' : 'Erreur de suppression');
    }
  };

  const handleAddImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(isArabic ? 'يرجى اختيار ملف صورة' : 'Veuillez sélectionner une image');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(isArabic ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت' : 'La taille de l\'image doit être inférieure à 5 Mo');
      return;
    }

    const uploadedImage = await handleImageUpload(file);
    if (uploadedImage) {
      setHeroContent(prev => ({
        ...prev,
        backgroundImages: [...(prev.backgroundImages || []), uploadedImage]
      }));
    }
  };

  const handleRemoveImage = async (index) => {
    const imageToRemove = heroContent.backgroundImages[index];
    if (window.confirm(isArabic ? 'هل أنت متأكد من حذف هذه الصورة؟' : 'Êtes-vous sûr de supprimer cette image?')) {
      await handleImageDelete(imageToRemove.path);
      setHeroContent(prev => ({
        ...prev,
        backgroundImages: prev.backgroundImages.filter((_, i) => i !== index)
      }));
    }
  };

  const handleReplaceImage = async (index, file) => {
    if (!file) return;

    // Delete old image
    const oldImage = heroContent.backgroundImages[index];
    await handleImageDelete(oldImage.path);

    // Upload new image
    const uploadedImage = await handleImageUpload(file);
    if (uploadedImage) {
      setHeroContent(prev => ({
        ...prev,
        backgroundImages: prev.backgroundImages.map((img, i) => 
          i === index ? uploadedImage : img
        )
      }));
    }
  };

  // Save Hero Content
  const handleSaveHero = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Convert flat structure to nested structure expected by LandingPage
      const heroData = {
        title: {
          fr: heroContent.titleFr,
          ar: heroContent.titleAr
        },
        subtitle: {
          fr: heroContent.subtitleFr,
          ar: heroContent.subtitleAr
        },
        description: {
          fr: heroContent.descriptionFr,
          ar: heroContent.descriptionAr
        },
        badge: {
          fr: heroContent.badgeFr,
          ar: heroContent.badgeAr
        },
        primaryButtonText: {
          fr: heroContent.primaryButtonTextFr,
          ar: heroContent.primaryButtonTextAr
        },
        secondaryButtonText: {
          fr: heroContent.secondaryButtonTextFr,
          ar: heroContent.secondaryButtonTextAr
        },
        // Background settings
        backgroundType: heroContent.backgroundType,
        gradientColors: heroContent.gradientColors,
        backgroundImages: heroContent.backgroundImages || [],
        carouselInterval: heroContent.carouselInterval || 5000,
        enabled: heroContent.enabled,
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'homepage', 'hero'), heroData);
      toast.success(isArabic ? 'تم حفظ القسم الرئيسي' : 'Section Hero sauvegardée');
    } catch (error) {
      console.error('Error saving hero:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  // Feature Operations
  const handleSaveFeature = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingFeature) {
        await updateDoc(doc(db, 'homepage-features', editingFeature.id), {
          ...featureForm,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم تحديث الميزة' : 'Fonctionnalité mise à jour');
      } else {
        await addDoc(collection(db, 'homepage-features'), {
          ...featureForm,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم إضافة الميزة' : 'Fonctionnalité ajoutée');
      }
      setShowFeatureModal(false);
      setEditingFeature(null);
      setFeatureForm({
        titleFr: '',
        titleAr: '',
        descriptionFr: '',
        descriptionAr: '',
        icon: 'BookOpenIcon',
        order: 0,
        enabled: true
      });
      fetchFeatures();
    } catch (error) {
      console.error('Error saving feature:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeature = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد؟' : 'Êtes-vous sûr?')) {
      try {
        await deleteDoc(doc(db, 'homepage-features', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchFeatures();
      } catch (error) {
        console.error('Error deleting feature:', error);
        toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
      }
    }
  };

  // News Operations
  const handleSaveNews = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingNews) {
        await updateDoc(doc(db, 'homepage-news', editingNews.id), {
          ...newsForm,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم تحديث الخبر' : 'Actualité mise à jour');
      } else {
        await addDoc(collection(db, 'homepage-news'), {
          ...newsForm,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم إضافة الخبر' : 'Actualité ajoutée');
      }
      setShowNewsModal(false);
      setEditingNews(null);
      setNewsForm({
        titleFr: '',
        titleAr: '',
        contentFr: '',
        contentAr: '',
        imageUrl: '',
        category: 'Actualités',
        enabled: true,
        publishDate: new Date().toISOString().split('T')[0]
      });
      fetchNews();
    } catch (error) {
      console.error('Error saving news:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد؟' : 'Êtes-vous sûr?')) {
      try {
        await deleteDoc(doc(db, 'homepage-news', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchNews();
      } catch (error) {
        console.error('Error deleting news:', error);
        toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
      }
    }
  };

  // Testimonial Operations
  const handleSaveTestimonial = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingTestimonial) {
        await updateDoc(doc(db, 'homepage-testimonials', editingTestimonial.id), {
          ...testimonialForm,
          updatedAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم تحديث الشهادة' : 'Témoignage mis à jour');
      } else {
        await addDoc(collection(db, 'homepage-testimonials'), {
          ...testimonialForm,
          createdAt: new Date().toISOString()
        });
        toast.success(isArabic ? 'تم إضافة الشهادة' : 'Témoignage ajouté');
      }
      setShowTestimonialModal(false);
      setEditingTestimonial(null);
      setTestimonialForm({
        nameFr: '',
        nameAr: '',
        roleFr: '',
        roleAr: '',
        contentFr: '',
        contentAr: '',
        avatarUrl: '',
        rating: 5,
        enabled: true
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت متأكد؟' : 'Êtes-vous sûr?')) {
      try {
        await deleteDoc(doc(db, 'homepage-testimonials', id));
        toast.success(isArabic ? 'تم الحذف' : 'Supprimé');
        fetchTestimonials();
      } catch (error) {
        console.error('Error deleting testimonial:', error);
        toast.error(isArabic ? 'خطأ في الحذف' : 'Erreur de suppression');
      }
    }
  };

  // Save Statistics
  const handleSaveStats = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Convert named stats to stats0, stats1, stats2, stats3 format expected by useHomeContent
      const statsData = {
        stats0: { 
          value: stats.students.valueFr, 
          labelFr: stats.students.labelFr, 
          labelAr: stats.students.labelAr,
          icon: '👨‍🎓'
        },
        stats1: { 
          value: stats.administrativeStaff.valueFr, 
          labelFr: stats.administrativeStaff.labelFr, 
          labelAr: stats.administrativeStaff.labelAr,
          icon: '👔'
        },
        stats2: { 
          value: stats.teachers.valueFr, 
          labelFr: stats.teachers.labelFr, 
          labelAr: stats.teachers.labelAr,
          icon: '👨‍🏫'
        },
        stats3: { 
          value: stats.satisfaction.valueFr, 
          labelFr: stats.satisfaction.labelFr, 
          labelAr: stats.satisfaction.labelAr,
          icon: '🎓'
        },
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'homepage', 'stats'), statsData);
      toast.success(isArabic ? 'تم حفظ الإحصائيات' : 'Statistiques sauvegardées');
    } catch (error) {
      console.error('Error saving stats:', error);
      toast.error(isArabic ? 'خطأ في الحفظ' : 'Erreur de sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const sectionGroups = [
    {
      title: isArabic ? 'محتوى الصفحة الرئيسية' : 'Contenu Page d\'Accueil',
      sections: [
        { id: 'hero', icon: PhotoIcon, label: isArabic ? 'القسم الرئيسي' : 'Section Hero', color: 'blue' },
        { id: 'stats', icon: ChartBarIcon, label: isArabic ? 'الإحصائيات' : 'Statistiques', color: 'indigo' },
        { id: 'about', icon: CheckCircleIcon, label: isArabic ? 'عن الثانوية' : 'À Propos', color: 'teal' },
        { id: 'features', icon: StarIcon, label: isArabic ? 'الميزات' : 'Fonctionnalités', color: 'yellow' }
      ]
    },
    {
      title: isArabic ? 'أخبار ومحتوى' : 'Actualités & Contenu',
      sections: [
        { id: 'news', icon: NewspaperIcon, label: isArabic ? 'الأخبار' : 'Actualités', color: 'red' },
        { id: 'announcements', icon: MegaphoneIcon, label: isArabic ? 'الإعلانات' : 'Annonces', color: 'orange' },
        { id: 'events', icon: CalendarIcon, label: isArabic ? 'الأحداث' : 'Événements', color: 'purple' },
        { id: 'testimonials', icon: MegaphoneIcon, label: isArabic ? 'الشهادات' : 'Témoignages', color: 'pink' }
      ]
    },
    {
      title: isArabic ? 'أنشطة ومعارض' : 'Activités & Galeries',
      sections: [
        { id: 'clubs', icon: UserGroupIcon, label: isArabic ? 'النوادي' : 'Clubs', color: 'violet' },
        { id: 'gallery', icon: PhotoIcon, label: isArabic ? 'المعرض' : 'Galerie', color: 'cyan' }
      ]
    },
    {
      title: isArabic ? 'اتصال وروابط' : 'Contact & Liens',
      sections: [
        { id: 'contact', icon: PhoneIcon, label: isArabic ? 'معلومات الاتصال' : 'Informations Contact', color: 'emerald' },
        { id: 'quicklinks', icon: LinkIcon, label: isArabic ? 'روابط سريعة' : 'Liens Rapides', color: 'lime' },
        { id: 'footer', icon: Squares2X2Icon, label: isArabic ? 'التذييل' : 'Footer', color: 'slate' }
      ]
    }
  ];

  const getColorClasses = (color, isActive) => {
    const colors = {
      blue: isActive ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-l-4 border-blue-600' : '',
      indigo: isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600' : '',
      teal: isActive ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-l-4 border-teal-600' : '',
      yellow: isActive ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-l-4 border-yellow-600' : '',
      red: isActive ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-l-4 border-red-600' : '',
      orange: isActive ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-l-4 border-orange-600' : '',
      pink: isActive ? 'bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 border-l-4 border-pink-600' : '',
      violet: isActive ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-l-4 border-violet-600' : '',
      cyan: isActive ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-l-4 border-cyan-600' : '',
      emerald: isActive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-600' : '',
      lime: isActive ? 'bg-lime-50 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400 border-l-4 border-lime-600' : '',
      slate: isActive ? 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-l-4 border-slate-600' : '',
      purple: isActive ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-l-4 border-purple-600' : ''
    };
    return colors[color] || '';
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar Navigation */}
      <div className="w-80 flex-shrink-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden sticky top-6">
          <div className="p-4 bg-gradient-to-r from-blue-600 to-violet-600">
            <h2 className="text-lg font-bold text-white">
              {isArabic ? 'إدارة المحتوى' : 'Gestion du Contenu'}
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-200px)] overflow-y-auto">
            {sectionGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="p-2">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2">
                  {group.title}
                </h3>
                <div className="space-y-1">
                  {group.sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? getColorClasses(section.color, true)
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="truncate">{section.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
      {/* Content Sections */}
      {/* NEW: Section Visibility Manager */}
      {activeSection === 'hero' && (
        <HeroSectionEditor
          heroContent={heroContent}
          setHeroContent={setHeroContent}
          handleSaveHero={handleSaveHero}
          handleAddImage={handleAddImage}
          handleRemoveImage={handleRemoveImage}
          handleReplaceImage={handleReplaceImage}
          uploadingImage={uploadingImage}
          loading={loading}
          isArabic={isArabic}
        />
      )}

      {activeSection === 'features' && (
        <FeaturesSection
          features={features}
          setShowFeatureModal={setShowFeatureModal}
          setEditingFeature={setEditingFeature}
          setFeatureForm={setFeatureForm}
          handleDeleteFeature={handleDeleteFeature}
          isArabic={isArabic}
        />
      )}

      {activeSection === 'news' && (
        <NewsSection
          news={news}
          setShowNewsModal={setShowNewsModal}
          setEditingNews={setEditingNews}
          setNewsForm={setNewsForm}
          handleDeleteNews={handleDeleteNews}
          isArabic={isArabic}
        />
      )}

      {activeSection === 'testimonials' && (
        <TestimonialsSection
          testimonials={testimonials}
          setShowTestimonialModal={setShowTestimonialModal}
          setEditingTestimonial={setEditingTestimonial}
          setTestimonialForm={setTestimonialForm}
          handleDeleteTestimonial={handleDeleteTestimonial}
          isArabic={isArabic}
        />
      )}

      {activeSection === 'stats' && (
        <StatsSection
          stats={stats}
          setStats={setStats}
          handleSaveStats={handleSaveStats}
          loading={loading}
          isArabic={isArabic}
        />
      )}

      {/* ✨ NOUVEAU: Sections pour les nouveaux contenus CMS */}
      {activeSection === 'announcements' && (
        <AnnouncementsManager isArabic={isArabic} />
      )}

      {activeSection === 'events' && (
        <EventsManager isArabic={isArabic} />
      )}

      {activeSection === 'clubs' && (
        <ClubsManager isArabic={isArabic} />
      )}

      {activeSection === 'gallery' && (
        <GalleryManager isArabic={isArabic} />
      )}

      {activeSection === 'quicklinks' && (
        <QuickLinksManager isArabic={isArabic} />
      )}

      {activeSection === 'contact' && (
        <ContactManager isArabic={isArabic} />
      )}

      {activeSection === 'about' && (
        <AboutManager isArabic={isArabic} />
      )}

      {activeSection === 'footer' && (
        <FooterManager isArabic={isArabic} />
      )}

      {/* Modals */}
      {showFeatureModal && (
        <FeatureModal
          featureForm={featureForm}
          setFeatureForm={setFeatureForm}
          handleSaveFeature={handleSaveFeature}
          setShowFeatureModal={setShowFeatureModal}
          editingFeature={editingFeature}
          loading={loading}
          iconOptions={iconOptions}
          isArabic={isArabic}
        />
      )}

      {showNewsModal && (
        <NewsModal
          newsForm={newsForm}
          setNewsForm={setNewsForm}
          handleSaveNews={handleSaveNews}
          setShowNewsModal={setShowNewsModal}
          editingNews={editingNews}
          loading={loading}
          isArabic={isArabic}
        />
      )}

      {showTestimonialModal && (
        <TestimonialModal
          testimonialForm={testimonialForm}
          setTestimonialForm={setTestimonialForm}
          handleSaveTestimonial={handleSaveTestimonial}
          setShowTestimonialModal={setShowTestimonialModal}
          editingTestimonial={editingTestimonial}
          loading={loading}
          isArabic={isArabic}
        />
      )}
      </div>
    </div>
  );
}

// ====================SUB-COMPONENT SECTIONS BELOW====================

// Features Section Component
function FeaturesSection({ features, setShowFeatureModal, setEditingFeature, setFeatureForm, handleDeleteFeature, isArabic }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'إدارة الميزات' : 'Gérer les Fonctionnalités'}
        </h2>
        <button
          onClick={() => {
            setEditingFeature(null);
            setFeatureForm({
              titleFr: '',
              titleAr: '',
              descriptionFr: '',
              descriptionAr: '',
              icon: 'BookOpenIcon',
              order: features.length,
              enabled: true
            });
            setShowFeatureModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة ميزة' : 'Ajouter Fonctionnalité'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div key={feature.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-gray-900 dark:text-white">
                {isArabic ? feature.titleAr : feature.titleFr}
              </h3>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                feature.enabled 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
              }`}>
                {feature.enabled ? (isArabic ? 'مفعل' : 'Actif') : (isArabic ? 'معطل' : 'Désactivé')}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {isArabic ? feature.descriptionAr : feature.descriptionFr}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingFeature(feature);
                  setFeatureForm(feature);
                  setShowFeatureModal(true);
                }}
                className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                <PencilIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'تعديل' : 'Modifier'}
              </button>
              <button
                onClick={() => handleDeleteFeature(feature.id)}
                className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <TrashIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'حذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// News Section Component  
function NewsSection({ news, setShowNewsModal, setEditingNews, setNewsForm, handleDeleteNews, isArabic }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'إدارة الأخبار والإعلانات' : 'Gérer Actualités et Annonces'}
        </h2>
        <button
          onClick={() => {
            setEditingNews(null);
            setNewsForm({
              titleFr: '',
              titleAr: '',
              contentFr: '',
              contentAr: '',
              imageUrl: '',
              category: 'Actualités',
              enabled: true,
              publishDate: new Date().toISOString().split('T')[0]
            });
            setShowNewsModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة خبر' : 'Ajouter Actualité'}
        </button>
      </div>

      <div className="space-y-4">
        {news.map((item) => (
          <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  {isArabic ? item.titleAr : item.titleFr}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {isArabic ? item.contentAr : item.contentFr}
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.publishDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setEditingNews(item);
                    setNewsForm(item);
                    setShowNewsModal(true);
                  }}
                  className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
                >
                  <PencilIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteNews(item.id)}
                  className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Testimonials Section Component
function TestimonialsSection({ testimonials, setShowTestimonialModal, setEditingTestimonial, setTestimonialForm, handleDeleteTestimonial, isArabic }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isArabic ? 'إدارة الشهادات' : 'Gérer les Témoignages'}
        </h2>
        <button
          onClick={() => {
            setEditingTestimonial(null);
            setTestimonialForm({
              nameFr: '',
              nameAr: '',
              roleFr: '',
              roleAr: '',
              contentFr: '',
              contentAr: '',
              avatarUrl: '',
              rating: 5,
              enabled: true
            });
            setShowTestimonialModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          {isArabic ? 'إضافة شهادة' : 'Ajouter Témoignage'}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              {testimonial.avatarUrl && (
                <img src={testimonial.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
              )}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {isArabic ? testimonial.nameAr : testimonial.nameFr}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic ? testimonial.roleAr : testimonial.roleFr}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {isArabic ? testimonial.contentAr : testimonial.contentFr}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingTestimonial(testimonial);
                  setTestimonialForm(testimonial);
                  setShowTestimonialModal(true);
                }}
                className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                <PencilIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'تعديل' : 'Modifier'}
              </button>
              <button
                onClick={() => handleDeleteTestimonial(testimonial.id)}
                className="flex-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/50"
              >
                <TrashIcon className="w-4 h-4 inline mr-1" />
                {isArabic ? 'حذف' : 'Supprimer'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stats Section Component
function StatsSection({ stats, setStats, handleSaveStats, loading, isArabic }) {
  // Display names for stats keys
  const statDisplayNames = {
    students: isArabic ? 'الطلاب' : 'Étudiants',
    administrativeStaff: isArabic ? 'الموظفون الإداريون' : 'Staff Administratif',
    teachers: isArabic ? 'المعلمون' : 'Enseignants',
    satisfaction: isArabic ? 'الرضا' : 'Satisfaction'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isArabic ? 'تحرير الإحصائيات' : 'Éditer les Statistiques'}
      </h2>
      
      <form onSubmit={handleSaveStats} className="space-y-6">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              {statDisplayNames[key] || key}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'القيمة (فرنسي)' : 'Valeur (Français)'}
                </label>
                <input
                  type="text"
                  value={value.valueFr}
                  onChange={(e) => setStats({
                    ...stats,
                    [key]: { ...value, valueFr: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'القيمة (عربي)' : 'Valeur (Arabe)'}
                </label>
                <input
                  type="text"
                  value={value.valueAr}
                  onChange={(e) => setStats({
                    ...stats,
                    [key]: { ...value, valueAr: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'التسمية (فرنسي)' : 'Label (Français)'}
                </label>
                <input
                  type="text"
                  value={value.labelFr}
                  onChange={(e) => setStats({
                    ...stats,
                    [key]: { ...value, labelFr: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {isArabic ? 'التسمية (عربي)' : 'Label (Arabe)'}
                </label>
                <input
                  type="text"
                  value={value.labelAr}
                  onChange={(e) => setStats({
                    ...stats,
                    [key]: { ...value, labelAr: e.target.value }
                  })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                  dir="rtl"
                />
              </div>
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ التغييرات' : 'Sauvegarder les modifications')}
        </button>
      </form>
    </div>
  );
}

// Feature Modal Component
function FeatureModal({ featureForm, setFeatureForm, handleSaveFeature, setShowFeatureModal, editingFeature, loading, iconOptions, isArabic }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {editingFeature 
            ? (isArabic ? 'تعديل الميزة' : 'Modifier la Fonctionnalité')
            : (isArabic ? 'إضافة ميزة جديدة' : 'Nouvelle Fonctionnalité')
          }
        </h2>

        <form onSubmit={handleSaveFeature} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
              </label>
              <input
                type="text"
                value={featureForm.titleFr}
                onChange={(e) => setFeatureForm({ ...featureForm, titleFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
              </label>
              <input
                type="text"
                value={featureForm.titleAr}
                onChange={(e) => setFeatureForm({ ...featureForm, titleAr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
              </label>
              <textarea
                value={featureForm.descriptionFr}
                onChange={(e) => setFeatureForm({ ...featureForm, descriptionFr: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
              </label>
              <textarea
                value={featureForm.descriptionAr}
                onChange={(e) => setFeatureForm({ ...featureForm, descriptionAr: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الأيقونة' : 'Icône'}
              </label>
              <select
                value={featureForm.icon}
                onChange={(e) => setFeatureForm({ ...featureForm, icon: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الترتيب' : 'Ordre'}
              </label>
              <input
                type="number"
                value={featureForm.order}
                onChange={(e) => setFeatureForm({ ...featureForm, order: parseInt(e.target.value) })}
                min="0"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featureEnabled"
              checked={featureForm.enabled}
              onChange={(e) => setFeatureForm({ ...featureForm, enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="featureEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? 'تفعيل هذه الميزة' : 'Activer cette fonctionnalité'}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ' : 'Sauvegarder')}
            </button>
            <button
              type="button"
              onClick={() => setShowFeatureModal(false)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// News Modal Component
function NewsModal({ newsForm, setNewsForm, handleSaveNews, setShowNewsModal, editingNews, loading, isArabic }) {
  const [uploadingNewsImage, setUploadingNewsImage] = useState(false);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {editingNews 
            ? (isArabic ? 'تعديل الخبر' : 'Modifier l\'Actualité')
            : (isArabic ? 'إضافة خبر جديد' : 'Nouvelle Actualité')
          }
        </h2>

        <form onSubmit={handleSaveNews} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
              </label>
              <input
                type="text"
                value={newsForm.titleFr}
                onChange={(e) => setNewsForm({ ...newsForm, titleFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
              </label>
              <input
                type="text"
                value={newsForm.titleAr}
                onChange={(e) => setNewsForm({ ...newsForm, titleAr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المحتوى (فرنسي)' : 'Contenu (Français)'}
              </label>
              <textarea
                value={newsForm.contentFr}
                onChange={(e) => setNewsForm({ ...newsForm, contentFr: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المحتوى (عربي)' : 'Contenu (Arabe)'}
              </label>
              <textarea
                value={newsForm.contentAr}
                onChange={(e) => setNewsForm({ ...newsForm, contentAr: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الفئة' : 'Catégorie'}
              </label>
              <select
                value={newsForm.category}
                onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {NEWS_CATEGORIES.filter(cat => cat.value !== 'all').map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {isArabic ? cat.label.ar : cat.label.fr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'تاريخ النشر' : 'Date de Publication'}
              </label>
              <input
                type="date"
                value={newsForm.publishDate}
                onChange={(e) => setNewsForm({ ...newsForm, publishDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <ImageUploadField
            label={isArabic ? 'صورة المقال (اختياري)' : 'Image de l\'article (optionnel)'}
            value={newsForm.imageUrl}
            onChange={async (file) => {
              if (file) {
                setUploadingNewsImage(true);
                try {
                  const url = await uploadImage(file, 'news', newsForm.imageUrl);
                  setNewsForm({ ...newsForm, imageUrl: url });
                  toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image téléchargée avec succès');
                } catch (error) {
                  console.error('Error uploading news image:', error);
                  toast.error(isArabic ? 'فشل رفع الصورة' : 'Échec du téléchargement');
                } finally {
                  setUploadingNewsImage(false);
                }
              }
            }}
            folder="news"
            disabled={uploadingNewsImage}
            required={false}
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="newsEnabled"
              checked={newsForm.enabled}
              onChange={(e) => setNewsForm({ ...newsForm, enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="newsEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? 'نشر هذا الخبر' : 'Publier cette actualité'}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ' : 'Sauvegarder')}
            </button>
            <button
              type="button"
              onClick={() => setShowNewsModal(false)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Testimonial Modal Component
function TestimonialModal({ testimonialForm, setTestimonialForm, handleSaveTestimonial, setShowTestimonialModal, editingTestimonial, loading, isArabic }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          {editingTestimonial 
            ? (isArabic ? 'تعديل الشهادة' : 'Modifier le Témoignage')
            : (isArabic ? 'إضافة شهادة جديدة' : 'Nouveau Témoignage')
          }
        </h2>

        <form onSubmit={handleSaveTestimonial} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الاسم (فرنسي)' : 'Nom (Français)'}
              </label>
              <input
                type="text"
                value={testimonialForm.nameFr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, nameFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الاسم (عربي)' : 'Nom (Arabe)'}
              </label>
              <input
                type="text"
                value={testimonialForm.nameAr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, nameAr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الدور (فرنسي)' : 'Rôle (Français)'}
              </label>
              <input
                type="text"
                value={testimonialForm.roleFr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, roleFr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الدور (عربي)' : 'Rôle (Arabe)'}
              </label>
              <input
                type="text"
                value={testimonialForm.roleAr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, roleAr: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المحتوى (فرنسي)' : 'Contenu (Français)'}
              </label>
              <textarea
                value={testimonialForm.contentFr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, contentFr: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'المحتوى (عربي)' : 'Contenu (Arabe)'}
              </label>
              <textarea
                value={testimonialForm.contentAr}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, contentAr: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <ImageUploadField
                label={isArabic ? 'الصورة الشخصية' : 'Avatar'}
                value={testimonialForm.avatarUrl}
                onChange={async (file) => {
                  if (file) {
                    setUploadingTestimonialAvatar(true);
                    try {
                      const url = await uploadImage(file, 'testimonials', testimonialForm.avatarUrl);
                      setTestimonialForm({ ...testimonialForm, avatarUrl: url });
                      toast.success(isArabic ? 'تم رفع الصورة بنجاح' : 'Image téléchargée avec succès');
                    } catch (error) {
                      console.error('Error uploading avatar:', error);
                      toast.error(isArabic ? 'فشل رفع الصورة' : 'Échec du téléchargement');
                    } finally {
                      setUploadingTestimonialAvatar(false);
                    }
                  }
                }}
                folder="testimonials"
                disabled={uploadingTestimonialAvatar}
                required={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'التقييم' : 'Note'}
              </label>
              <input
                type="number"
                value={testimonialForm.rating}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: parseInt(e.target.value) })}
                min="1"
                max="5"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="testimonialEnabled"
              checked={testimonialForm.enabled}
              onChange={(e) => setTestimonialForm({ ...testimonialForm, enabled: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <label htmlFor="testimonialEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isArabic ? 'نشر هذه الشهادة' : 'Publier ce témoignage'}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-50"
            >
              {loading ? (isArabic ? 'جاري الحفظ...' : 'Sauvegarde...') : (isArabic ? 'حفظ' : 'Sauvegarder')}
            </button>
            <button
              type="button"
              onClick={() => setShowTestimonialModal(false)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition"
            >
              {isArabic ? 'إلغاء' : 'Annuler'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
