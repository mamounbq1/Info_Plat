import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { UserGroupIcon, MagnifyingGlassIcon, UsersIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function ClubsPage() {
  const { isArabic } = useLanguage();
  const [clubs, setClubs] = useState([]);
  const [filteredClubs, setFilteredClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClubs();
  }, []);

  useEffect(() => {
    filterClubs();
  }, [clubs, searchTerm]);

  const fetchClubs = async () => {
    try {
      const clubsRef = collection(db, 'homepage-clubs');
      let clubsQuery;
      
      try {
        clubsQuery = query(clubsRef, where('enabled', '==', true), orderBy('order', 'asc'));
        const clubsSnapshot = await getDocs(clubsQuery);
        const clubsData = clubsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setClubs(clubsData);
      } catch (error) {
        console.log('Index not available, using fallback query');
        clubsQuery = query(clubsRef, where('enabled', '==', true));
        const clubsSnapshot = await getDocs(clubsQuery);
        const clubsData = clubsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setClubs(clubsData);
      }
    } catch (error) {
      console.error('Error fetching clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClubs = () => {
    if (!searchTerm) {
      setFilteredClubs(clubs);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = clubs.filter(club => {
      const name = isArabic ? club.nameAr : club.nameFr;
      const description = isArabic ? club.descriptionAr : club.descriptionFr;
      return name?.toLowerCase().includes(search) || description?.toLowerCase().includes(search);
    });
    setFilteredClubs(filtered);
  };

  const getGradientClass = (color) => {
    const gradients = {
      blue: 'from-blue-500 to-blue-600',
      violet: 'from-violet-500 to-purple-600',
      green: 'from-green-500 to-emerald-600',
      orange: 'from-orange-500 to-red-600',
      pink: 'from-pink-500 to-rose-600',
      cyan: 'from-cyan-500 to-blue-600',
      indigo: 'from-indigo-500 to-violet-600',
      yellow: 'from-yellow-500 to-orange-600'
    };
    return gradients[color] || gradients.blue;
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
            <UserGroupIcon className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'النوادي والأنشطة' : 'Clubs et Activités'}
            </h1>
            <p className="text-xl text-blue-100">
              {isArabic 
                ? 'انضم إلى نوادينا واكتشف شغفك'
                : 'Rejoignez nos clubs et découvrez votre passion'}
            </p>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-20 z-40 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={isArabic ? 'البحث في النوادي...' : 'Rechercher un club...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
              {filteredClubs.length} {isArabic ? 'نادي' : 'club(s)'}
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Grid */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {filteredClubs.length === 0 ? (
            <div className="text-center py-20">
              <UserGroupIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'لا توجد نوادي' : 'Aucun club'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {isArabic ? 'لم يتم العثور على نتائج للبحث الخاص بك' : 'Aucun résultat trouvé pour votre recherche'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredClubs.map((club) => (
                <Link
                  key={club.id}
                  to={`/clubs/${club.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-2"
                >
                  {/* Icon Header */}
                  <div className={`relative h-32 bg-gradient-to-br ${getGradientClass(club.color)} flex items-center justify-center`}>
                    <span className="text-6xl">{club.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {isArabic ? club.nameAr : club.nameFr}
                    </h3>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {isArabic ? club.descriptionAr : club.descriptionFr}
                    </p>

                    {/* Member Count */}
                    {club.memberCount && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <UsersIcon className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        <span>{club.memberCount} {isArabic ? 'عضو' : 'membres'}</span>
                      </div>
                    )}

                    {/* Button */}
                    <div className="mt-6">
                      <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium group-hover:bg-blue-700 transition-colors">
                        {isArabic ? 'اكتشف المزيد' : 'En savoir plus'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {isArabic ? 'مهتم بالانضمام؟' : 'Intéressé à Rejoindre?'}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            {isArabic 
              ? 'تواصل معنا لمعرفة المزيد عن نوادينا وكيفية الانضمام'
              : 'Contactez-nous pour en savoir plus sur nos clubs et comment rejoindre'}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            {isArabic ? 'اتصل بنا' : 'Contactez-Nous'}
          </Link>
        </div>
      </section>
    </SharedLayout>
  );
}
