import { useState } from 'react';
import { 
  PhotoIcon, 
  TrashIcon, 
  ArrowPathIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const gradientPresets = [
  { name: 'Blue-Violet', from: 'blue-600', via: 'violet-600', to: 'purple-700' },
  { name: 'Pink-Orange', from: 'pink-500', via: 'rose-500', to: 'orange-500' },
  { name: 'Green-Teal', from: 'green-500', via: 'teal-500', to: 'cyan-600' },
  { name: 'Indigo-Blue', from: 'indigo-600', via: 'blue-600', to: 'cyan-500' },
  { name: 'Purple-Pink', from: 'purple-600', via: 'pink-600', to: 'rose-500' },
  { name: 'Yellow-Red', from: 'yellow-400', via: 'orange-500', to: 'red-600' },
];

// Composant pour chaque image draggable
function SortableImageItem({ 
  image, 
  index, 
  totalImages,
  isActive, 
  onReplace, 
  onRemove, 
  uploadingImage,
  isArabic 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'z-50' : ''}`}
    >
      <img
        src={image.url}
        alt={`Background ${index + 1}`}
        className="w-full h-32 object-cover rounded-lg shadow-md"
      />
      
      {/* Drag Handle */}
      {totalImages > 1 && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded cursor-move shadow-lg transition z-20"
          title={isArabic ? 'اسحب لإعادة الترتيب' : 'Glisser pour réorganiser'}
        >
          <Bars3Icon className="w-4 h-4" />
        </div>
      )}

      {/* Actions Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2 z-10">
        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg shadow-lg transition">
          <ArrowPathIcon className="w-5 h-5" />
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => onReplace(index, e)}
            className="hidden"
            disabled={uploadingImage}
          />
        </label>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg shadow-lg transition"
          disabled={uploadingImage}
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Image Number */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded font-medium">
        #{index + 1}
      </div>

      {/* Active Badge */}
      {isActive && (
        <div className="absolute bottom-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1 shadow-lg">
          <CheckCircleIcon className="w-3 h-3" />
          {isArabic ? 'نشط' : 'Active'}
        </div>
      )}
    </div>
  );
}

export default function HeroSectionEditor({ 
  heroContent, 
  setHeroContent, 
  handleSaveHero, 
  handleAddImage,
  handleRemoveImage,
  handleReplaceImage,
  uploadingImage,
  loading, 
  isArabic 
}) {
  const [showImageSelector, setShowImageSelector] = useState(false);

  // Configuration des sensors pour le drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de mouvement avant de considérer comme drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(isArabic 
          ? 'حجم الملف كبير جدًا. الحد الأقصى هو 5 ميغابايت'
          : 'Fichier trop volumineux. Maximum 5MB');
        return;
      }
      handleAddImage(e);
    }
  };

  const handleReplaceImagePreview = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier
      if (file.size > 5 * 1024 * 1024) {
        alert(isArabic 
          ? 'حجم الملف كبير جدًا. الحد الأقصى هو 5 ميغابايت'
          : 'Fichier trop volumineux. Maximum 5MB');
        return;
      }
      handleReplaceImage(index, file);
    }
  };

  // Sélectionner une image existante pour le mode "image unique"
  const handleSelectExistingImage = (imageUrl) => {
    setHeroContent({
      ...heroContent,
      backgroundImages: [{ url: imageUrl, name: 'Selected image' }]
    });
    setShowImageSelector(false);
  };

  // Gérer le drag & drop pour réorganiser les images
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = heroContent.backgroundImages.findIndex(img => img.url === active.id);
      const newIndex = heroContent.backgroundImages.findIndex(img => img.url === over.id);

      const reorderedImages = arrayMove(heroContent.backgroundImages, oldIndex, newIndex);
      
      setHeroContent({
        ...heroContent,
        backgroundImages: reorderedImages
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isArabic ? 'تحرير القسم الرئيسي' : 'Éditer le Hero Section'}
      </h2>
      
      <form onSubmit={handleSaveHero} className="space-y-6">
        {/* Text Content Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">
            {isArabic ? '📝 المحتوى النصي' : '📝 Contenu Textuel'}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (فرنسي)' : 'Titre (Français)'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={heroContent.titleFr}
                onChange={(e) => setHeroContent({ ...heroContent, titleFr: e.target.value })}
                placeholder="Ex: Bienvenue au Lycée EduInfor"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان (عربي)' : 'Titre (Arabe)'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={heroContent.titleAr}
                onChange={(e) => setHeroContent({ ...heroContent, titleAr: e.target.value })}
                placeholder="مثال: مرحبا بكم في ثانوية EduInfor"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان الفرعي (فرنسي)' : 'Sous-titre (Français)'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={heroContent.subtitleFr}
                onChange={(e) => setHeroContent({ ...heroContent, subtitleFr: e.target.value })}
                rows={3}
                placeholder="Ex: Excellence académique et développement personnel"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'العنوان الفرعي (عربي)' : 'Sous-titre (Arabe)'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                value={heroContent.subtitleAr}
                onChange={(e) => setHeroContent({ ...heroContent, subtitleAr: e.target.value })}
                rows={3}
                placeholder="مثال: التميز الأكاديمي والتنمية الشخصية"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الوصف (فرنسي)' : 'Description (Français)'}
              </label>
              <textarea
                value={heroContent.descriptionFr}
                onChange={(e) => setHeroContent({ ...heroContent, descriptionFr: e.target.value })}
                rows={2}
                placeholder="Ex: Préparez votre avenir dans un environnement moderne"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'الوصف (عربي)' : 'Description (Arabe)'}
              </label>
              <textarea
                value={heroContent.descriptionAr}
                onChange={(e) => setHeroContent({ ...heroContent, descriptionAr: e.target.value })}
                rows={2}
                placeholder="مثال: حضر مستقبلك في بيئة حديثة"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'شارة (فرنسي)' : 'Badge (Français)'}
              </label>
              <input
                type="text"
                value={heroContent.badgeFr}
                onChange={(e) => setHeroContent({ ...heroContent, badgeFr: e.target.value })}
                placeholder="Ex: Bienvenue au"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'شارة (عربي)' : 'Badge (Arabe)'}
              </label>
              <input
                type="text"
                value={heroContent.badgeAr}
                onChange={(e) => setHeroContent({ ...heroContent, badgeAr: e.target.value })}
                placeholder="مثال: مرحبا بكم في"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'نص الزر الأساسي (فرنسي)' : 'Bouton Principal (Français)'}
              </label>
              <input
                type="text"
                value={heroContent.primaryButtonTextFr}
                onChange={(e) => setHeroContent({ ...heroContent, primaryButtonTextFr: e.target.value })}
                placeholder="Ex: Découvrir le Lycée"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'نص الزر الأساسي (عربي)' : 'Bouton Principal (Arabe)'}
              </label>
              <input
                type="text"
                value={heroContent.primaryButtonTextAr}
                onChange={(e) => setHeroContent({ ...heroContent, primaryButtonTextAr: e.target.value })}
                placeholder="مثال: اكتشف الثانوية"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'نص الزر الثانوي (فرنسي)' : 'Bouton Secondaire (Français)'}
              </label>
              <input
                type="text"
                value={heroContent.secondaryButtonTextFr}
                onChange={(e) => setHeroContent({ ...heroContent, secondaryButtonTextFr: e.target.value })}
                placeholder="Ex: Nous Contacter"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isArabic ? 'نص الزر الثانوي (عربي)' : 'Bouton Secondaire (Arabe)'}
              </label>
              <input
                type="text"
                value={heroContent.secondaryButtonTextAr}
                onChange={(e) => setHeroContent({ ...heroContent, secondaryButtonTextAr: e.target.value })}
                placeholder="مثال: اتصل بنا"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                dir="rtl"
              />
            </div>
          </div>
        </div>

        {/* Background Type Selection */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
            {isArabic ? '🎨 نوع الخلفية' : '🎨 Type de Fond d\'Écran'}
          </h3>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <button
              type="button"
              onClick={() => setHeroContent({ ...heroContent, backgroundType: 'gradient' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                heroContent.backgroundType === 'gradient'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🌈</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {isArabic ? 'تدرج' : 'Dégradé'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {isArabic ? 'ألوان متدرجة' : 'Couleurs graduées'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHeroContent({ ...heroContent, backgroundType: 'image' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                heroContent.backgroundType === 'image'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🖼️</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {isArabic ? 'صورة واحدة' : 'Image Unique'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {isArabic ? 'صورة ثابتة' : 'Image statique'}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setHeroContent({ ...heroContent, backgroundType: 'carousel' })}
              className={`p-4 rounded-lg border-2 transition-all ${
                heroContent.backgroundType === 'carousel'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                  : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              <div className="text-center">
                <div className="text-3xl mb-2">🎠</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {isArabic ? 'دائري' : 'Carousel'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {isArabic ? 'عدة صور' : 'Images multiples'}
                </div>
              </div>
            </button>
          </div>

          {/* Gradient Settings */}
          {heroContent.backgroundType === 'gradient' && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {isArabic ? 'إعدادات التدرج' : 'Paramètres du Dégradé'}
                </h4>
                <InformationCircleIcon className="w-5 h-5 text-blue-500" />
              </div>
              
              {/* Preset Gradients */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {isArabic ? 'قوالب جاهزة' : 'Modèles Prédéfinis'}
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                  {gradientPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setHeroContent({
                        ...heroContent,
                        gradientColors: { from: preset.from, via: preset.via, to: preset.to }
                      })}
                      className={`p-3 rounded-lg bg-gradient-to-r from-${preset.from} via-${preset.via} to-${preset.to} text-white font-medium hover:scale-105 transition shadow-md`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {isArabic ? 'تخصيص الألوان' : 'Couleurs Personnalisées'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                      {isArabic ? 'من' : 'De'}
                    </label>
                    <select
                      value={heroContent.gradientColors?.from || 'blue-600'}
                      onChange={(e) => setHeroContent({
                        ...heroContent,
                        gradientColors: { ...heroContent.gradientColors, from: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded border dark:bg-gray-600 dark:border-gray-500 text-sm"
                    >
                      {['blue-600', 'violet-600', 'purple-600', 'pink-600', 'rose-600', 'red-600', 'orange-600', 'amber-600', 'yellow-600', 'lime-600', 'green-600', 'emerald-600', 'teal-600', 'cyan-600', 'sky-600', 'indigo-600'].map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                      {isArabic ? 'عبر' : 'Via'}
                    </label>
                    <select
                      value={heroContent.gradientColors?.via || 'violet-600'}
                      onChange={(e) => setHeroContent({
                        ...heroContent,
                        gradientColors: { ...heroContent.gradientColors, via: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded border dark:bg-gray-600 dark:border-gray-500 text-sm"
                    >
                      {['blue-600', 'violet-600', 'purple-600', 'pink-600', 'rose-600', 'red-600', 'orange-600', 'amber-600', 'yellow-600', 'lime-600', 'green-600', 'emerald-600', 'teal-600', 'cyan-600', 'sky-600', 'indigo-600'].map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">
                      {isArabic ? 'إلى' : 'À'}
                    </label>
                    <select
                      value={heroContent.gradientColors?.to || 'purple-700'}
                      onChange={(e) => setHeroContent({
                        ...heroContent,
                        gradientColors: { ...heroContent.gradientColors, to: e.target.value }
                      })}
                      className="w-full px-3 py-2 rounded border dark:bg-gray-600 dark:border-gray-500 text-sm"
                    >
                      {['blue-700', 'violet-700', 'purple-700', 'pink-700', 'rose-700', 'red-700', 'orange-700', 'amber-700', 'yellow-700', 'lime-700', 'green-700', 'emerald-700', 'teal-700', 'cyan-700', 'sky-700', 'indigo-700'].map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Gradient Preview */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  {isArabic ? 'معاينة' : 'Aperçu'}
                </label>
                <div className={`h-24 rounded-lg bg-gradient-to-r from-${heroContent.gradientColors?.from} via-${heroContent.gradientColors?.via} to-${heroContent.gradientColors?.to} shadow-inner`}></div>
              </div>
            </div>
          )}

          {/* Image Upload Settings */}
          {(heroContent.backgroundType === 'image' || heroContent.backgroundType === 'carousel') && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {heroContent.backgroundType === 'carousel' 
                    ? (isArabic ? 'صور الدائري' : 'Images du Carousel')
                    : (isArabic ? 'صورة الخلفية' : 'Image de Fond')
                  }
                </h4>
                {heroContent.backgroundImages && heroContent.backgroundImages.length > 0 && (
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircleIcon className="w-4 h-4" />
                    {heroContent.backgroundImages.length} {isArabic ? 'صورة' : 'image(s)'}
                  </span>
                )}
              </div>

              {/* Image Recommendations */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
                <div className="flex items-start gap-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {isArabic ? '📏 المواصفات الموصى بها:' : '📏 Spécifications Recommandées:'}
                    </p>
                    <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                      <li>• <strong>{isArabic ? 'الحجم:' : 'Taille:'}</strong> 1920x1080px (Full HD) {isArabic ? 'أو أكثر' : 'ou plus'}</li>
                      <li>• <strong>{isArabic ? 'النسبة:' : 'Ratio:'}</strong> 16:9 {isArabic ? '(أفقي)' : '(paysage)'}</li>
                      <li>• <strong>{isArabic ? 'التنسيق:' : 'Format:'}</strong> JPG, PNG, WEBP</li>
                      <li>• <strong>{isArabic ? 'الحجم الأقصى:' : 'Poids max:'}</strong> 5MB</li>
                      {heroContent.backgroundImages && heroContent.backgroundImages.length > 1 && (
                        <li>• <strong>{isArabic ? 'إعادة الترتيب:' : 'Réorganiser:'}</strong> {isArabic ? 'اسحب أيقونة ☰ لتغيير الترتيب' : 'Glissez l\'icône ☰ pour changer l\'ordre'}</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mode Image Unique: Select from existing images */}
              {heroContent.backgroundType === 'image' && heroContent.backgroundImages && heroContent.backgroundImages.length === 0 && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setShowImageSelector(!showImageSelector)}
                    className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    {isArabic ? '🖼️ اختر من الصور الموجودة' : '🖼️ Choisir parmi les images existantes'}
                  </button>
                  
                  {showImageSelector && heroContent.backgroundImages && heroContent.backgroundImages.length > 0 && (
                    <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        {isArabic ? 'حدد صورة:' : 'Sélectionnez une image:'}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {heroContent.backgroundImages.map((image, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectExistingImage(image.url)}
                            className="relative group overflow-hidden rounded-lg hover:ring-2 hover:ring-green-500 transition"
                          >
                            <img
                              src={image.url}
                              alt={`Option ${index + 1}`}
                              className="w-full h-20 object-cover"
                            />
                            <div className="absolute inset-0 bg-green-600 bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                              <CheckCircleIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-50 dark:bg-gray-700 text-gray-500">
                        {isArabic ? 'أو' : 'OU'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <div>
                <label className="block w-full cursor-pointer">
                  <div className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
                    uploadingImage 
                      ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-600'
                  } ${heroContent.backgroundType === 'image' && heroContent.backgroundImages?.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <PhotoIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                      {uploadingImage 
                        ? (isArabic ? '⏳ جاري الرفع...' : '⏳ Téléchargement en cours...')
                        : (isArabic ? 'انقر لتحميل صورة جديدة' : 'Cliquez pour télécharger une nouvelle image')
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP • {isArabic ? 'الحد الأقصى 5MB' : 'Max 5MB'} • 1920x1080px {isArabic ? 'موصى به' : 'recommandé'}
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                    disabled={uploadingImage || (heroContent.backgroundType === 'image' && heroContent.backgroundImages?.length > 0)}
                  />
                </label>
              </div>

              {/* Display Uploaded Images with Drag & Drop */}
              {heroContent.backgroundImages && heroContent.backgroundImages.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isArabic ? 'الصور المرفوعة' : 'Images Téléchargées'}
                    </label>
                    {heroContent.backgroundImages.length > 1 && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Bars3Icon className="w-4 h-4" />
                        {isArabic ? 'اسحب لإعادة الترتيب' : 'Glissez pour réorganiser'}
                      </span>
                    )}
                  </div>
                  
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={heroContent.backgroundImages.map(img => img.url)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {heroContent.backgroundImages.map((image, index) => (
                          <SortableImageItem
                            key={image.url}
                            image={image}
                            index={index}
                            totalImages={heroContent.backgroundImages.length}
                            isActive={heroContent.backgroundType === 'image' || index === 0}
                            onReplace={handleReplaceImagePreview}
                            onRemove={handleRemoveImage}
                            uploadingImage={uploadingImage}
                            isArabic={isArabic}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* Carousel Settings */}
              {heroContent.backgroundType === 'carousel' && (
                <>
                  {heroContent.backgroundImages?.length > 1 ? (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        ⏱️ {isArabic ? 'فترة التبديل (بالثواني)' : 'Intervalle de Rotation (secondes)'}
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="20"
                        value={heroContent.carouselInterval / 1000}
                        onChange={(e) => setHeroContent({
                          ...heroContent,
                          carouselInterval: parseInt(e.target.value) * 1000
                        })}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {isArabic 
                          ? 'الفترة الموصى بها: 5-10 ثواني' 
                          : 'Intervalle recommandé: 5-10 secondes'}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 text-sm text-yellow-800 dark:text-yellow-200">
                      {isArabic 
                        ? '⚠️ تحتاج إلى صورتين على الأقل للدائري' 
                        : '⚠️ Besoin d\'au moins 2 images pour le carousel'}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <input
            type="checkbox"
            id="heroEnabled"
            checked={heroContent.enabled}
            onChange={(e) => setHeroContent({ ...heroContent, enabled: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="heroEnabled" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
            {isArabic ? '✅ تفعيل القسم الرئيسي على الصفحة الرئيسية' : '✅ Activer le Hero Section sur la page d\'accueil'}
          </label>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={loading || uploadingImage}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading 
            ? (isArabic ? '⏳ جاري الحفظ...' : '⏳ Sauvegarde en cours...') 
            : (isArabic ? '💾 حفظ التغييرات' : '💾 Sauvegarder les Modifications')}
        </button>
      </form>
    </div>
  );
}
