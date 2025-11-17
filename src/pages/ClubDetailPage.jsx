import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  UserGroupIcon, 
  ArrowLeftIcon, 
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export default function ClubDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinFormData, setJoinFormData] = useState({
    name: '',
    email: '',
    phone: '',
    grade: '',
    message: ''
  });

  useEffect(() => {
    fetchClub();
  }, [id]);

  const fetchClub = async () => {
    try {
      const clubRef = doc(db, 'homepage-clubs', id);
      const clubSnap = await getDoc(clubRef);

      if (clubSnap.exists()) {
        setClub({ id: clubSnap.id, ...clubSnap.data() });
      } else {
        console.error('Club not found');
        navigate('/clubs');
      }
    } catch (error) {
      console.error('Error fetching club:', error);
    } finally {
      setLoading(false);
    }
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

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Save club join request to Firestore 'messages' collection
      // This will appear in MessagesManager alongside contact messages
      const messageData = {
        type: 'club_request', // Identify as club join request
        clubId: club.id,
        clubName: isArabic ? club.nameAr : club.nameFr,
        name: joinFormData.name,
        email: joinFormData.email,
        phone: joinFormData.phone,
        grade: joinFormData.grade,
        subject: `${isArabic ? 'طلب الانضمام إلى نادي: ' : 'Demande d\'adhésion au club: '}${isArabic ? club.nameAr : club.nameFr}`,
        message: joinFormData.message || (isArabic ? 'أرغب في الانضمام إلى هذا النادي.' : 'Je souhaite rejoindre ce club.'),
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: 'pending',
        replied: false
      };
      
      await addDoc(collection(db, 'messages'), messageData);
      
      toast.success(isArabic ? 'تم إرسال طلبك بنجاح!' : 'Votre demande a été envoyée avec succès!');
      setJoinFormData({ name: '', email: '', phone: '', grade: '', message: '' });
      
    } catch (error) {
      console.error('Error submitting club join request:', error);
      toast.error(isArabic ? 'حدث خطأ أثناء إرسال الطلب' : 'Erreur lors de l\'envoi de la demande');
    }
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

  if (!club) {
    return (
      <SharedLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <UserGroupIcon className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? 'النادي غير موجود' : 'Club introuvable'}
            </h2>
            <Link to="/clubs" className="text-blue-600 hover:text-blue-700">
              {isArabic ? 'العودة إلى النوادي' : 'Retour aux clubs'}
            </Link>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      {/* Back Button */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/clubs')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeftIcon className={`w-5 h-5 ${isArabic ? 'rotate-180' : ''}`} />
            <span>{isArabic ? 'العودة إلى النوادي' : 'Retour aux clubs'}</span>
          </button>
        </div>
      </div>

      {/* Club Header */}
      <section className={`relative bg-gradient-to-br ${getGradientClass(club.color)} text-white py-20 overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-8xl mb-6 animate-pulse">
              {club.icon}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? club.nameAr : club.nameFr}
            </h1>
            <p className="text-xl text-white/90">
              {isArabic ? club.descriptionAr : club.descriptionFr}
            </p>
            
            {club.memberCount && (
              <div className="mt-6 inline-flex items-center bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
                <UsersIcon className="w-6 h-6 mr-2 rtl:mr-0 rtl:ml-2" />
                <span className="font-semibold">{club.memberCount} {isArabic ? 'عضو نشط' : 'membres actifs'}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Club Details */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {isArabic ? 'عن النادي' : 'À Propos du Club'}
              </h2>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {isArabic ? club.descriptionAr : club.descriptionFr}
                </p>
              </div>

              {/* Activities or Schedule */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {isArabic ? 'جدول الاجتماعات' : 'Horaire'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isArabic ? 'كل يوم أربعاء، 15:00 - 17:00' : 'Chaque mercredi, 15h00 - 17h00'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <MapPinIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {isArabic ? 'الموقع' : 'Lieu'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isArabic ? 'قاعة الأنشطة، الطابق الثاني' : 'Salle des activités, 2ème étage'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                {isArabic ? 'انضم إلى النادي' : 'Rejoindre le Club'}
              </h2>
              <form onSubmit={handleJoinSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'الاسم الكامل' : 'Nom complet'}
                    </label>
                    <input
                      type="text"
                      required
                      value={joinFormData.name}
                      onChange={(e) => setJoinFormData({...joinFormData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={joinFormData.email}
                      onChange={(e) => setJoinFormData({...joinFormData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'رقم الهاتف' : 'Téléphone'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={joinFormData.phone}
                      onChange={(e) => setJoinFormData({...joinFormData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'المستوى' : 'Niveau'}
                    </label>
                    <select
                      required
                      value={joinFormData.grade}
                      onChange={(e) => setJoinFormData({...joinFormData, grade: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">{isArabic ? 'اختر المستوى' : 'Sélectionner'}</option>
                      <option value="1ere">{isArabic ? 'الأولى' : '1ère année'}</option>
                      <option value="2eme">{isArabic ? 'الثانية' : '2ème année'}</option>
                      <option value="3eme">{isArabic ? 'الثالثة' : '3ème année'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'لماذا تريد الانضمام؟' : 'Pourquoi voulez-vous rejoindre?'}
                  </label>
                  <textarea
                    rows={4}
                    value={joinFormData.message}
                    onChange={(e) => setJoinFormData({...joinFormData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  {isArabic ? 'إرسال الطلب' : 'Envoyer la Demande'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
