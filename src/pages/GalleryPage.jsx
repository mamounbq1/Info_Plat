import { useState, useEffect } from 'react';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { PhotoIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { GALLERY_CATEGORIES, getCategoryLabel } from '../constants/galleryCategories';

export default function GalleryPage() {
  const { isArabic } = useLanguage();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12; // Number of images per page

  // Use categories from shared constants
  const categories = GALLERY_CATEGORIES;

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const galleryRef = collection(db, 'homepage-gallery');
      let galleryQuery;
      
      try {
        galleryQuery = query(galleryRef, where('enabled', '==', true), orderBy('order', 'asc'));
        const gallerySnapshot = await getDocs(galleryQuery);
        const galleryData = gallerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setImages(galleryData);
      } catch (error) {
        console.log('Index not available, using fallback query');
        galleryQuery = query(galleryRef, where('enabled', '==', true));
        const gallerySnapshot = await getDocs(galleryQuery);
        const galleryData = gallerySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setImages(galleryData);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter images by selected category
  const filteredImages = selectedCategory === 'all' 
    ? images 
    : images.filter(img => img.category === selectedCategory);

  // Pagination calculations
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const openLightbox = (image, pageIndex) => {
    // Calculate the actual index in filteredImages array
    const actualIndex = indexOfFirstImage + pageIndex;
    setSelectedImage({ ...image, index: actualIndex });
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateLightbox = (direction) => {
    const currentIndex = selectedImage.index;
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % filteredImages.length
      : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    
    setSelectedImage({ ...filteredImages[newIndex], index: newIndex });
  };

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
      <section className="bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <PhotoIcon className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'معرض الصور' : 'Galerie Photos'}
            </h1>
            <p className="text-xl text-blue-100">
              {isArabic 
                ? 'اكتشف لحظات لا تُنسى من حياتنا المدرسية'
                : 'Découvrez les moments mémorables de notre vie scolaire'}
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center gap-3 overflow-x-auto pb-2">
            <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  selectedCategory === category.value
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {isArabic ? category.label.ar : category.label.fr}
              </button>
            ))}
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            {filteredImages.length} {isArabic ? 'صورة' : 'photo(s)'}
            {totalPages > 1 && (
              <span className="mx-2">•</span>
            )}
            {totalPages > 1 && (
              <span>
                {isArabic ? `الصفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} sur ${totalPages}`}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredImages.length === 0 ? (
            <div className="text-center py-20">
              <PhotoIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'لا توجد صور' : 'Aucune photo'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isArabic ? 'لا توجد صور في هذه الفئة' : 'Aucune photo dans cette catégorie'}
              </p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {currentImages.map((image, index) => (
                <div
                  key={image.id}
                  onClick={() => openLightbox(image, index)}
                  className="group relative break-inside-avoid cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  <div className="relative bg-gradient-to-br from-blue-500 to-violet-600">
                    <img
                      src={image.imageUrl}
                      alt={isArabic ? image.titleAr : image.titleFr}
                      crossOrigin="anonymous"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.className = 'relative bg-gradient-to-br from-blue-500 to-violet-600 h-64 flex items-center justify-center';
                        const icon = document.createElement('div');
                        icon.innerHTML = '<svg class="w-20 h-20 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                        e.target.parentElement.appendChild(icon.firstChild);
                      }}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 w-full">
                        <p className="text-white font-medium text-sm">
                          {isArabic ? image.titleAr : image.titleFr}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isArabic ? 'السابق' : 'Précédent'}
              </button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Show first page, last page, current page, and pages around current
                  const showPage = 
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                  
                  const showEllipsis = 
                    (pageNumber === 2 && currentPage > 3) ||
                    (pageNumber === totalPages - 1 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span key={pageNumber} className="px-3 py-2 text-gray-500 dark:text-gray-400">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => goToPage(pageNumber)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentPage === pageNumber
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {isArabic ? 'التالي' : 'Suivant'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <XMarkIcon className="w-8 h-8 text-white" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
            className="absolute left-4 rtl:left-auto rtl:right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronLeftIcon className={`w-8 h-8 text-white ${isArabic ? 'rotate-180' : ''}`} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
            className="absolute right-4 rtl:right-auto rtl:left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <ChevronRightIcon className={`w-8 h-8 text-white ${isArabic ? 'rotate-180' : ''}`} />
          </button>

          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} className="max-w-6xl w-full">
            <img
              src={selectedImage.imageUrl}
              alt={isArabic ? selectedImage.titleAr : selectedImage.titleFr}
              crossOrigin="anonymous"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Caption */}
            {(selectedImage.titleFr || selectedImage.titleAr) && (
              <div className="mt-4 text-center">
                <p className="text-white text-lg">
                  {isArabic ? selectedImage.titleAr : selectedImage.titleFr}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {selectedImage.index + 1} / {filteredImages.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </SharedLayout>
  );
}
