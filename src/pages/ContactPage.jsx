import { useState, useEffect } from 'react';
import SharedLayout from '../components/SharedLayout';
import { useLanguage } from '../contexts/LanguageContext';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const { isArabic } = useLanguage();
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      // Corrected: Use doc() to get document from homepage collection
      const contactDocRef = doc(db, 'homepage', 'contact');
      const contactSnapshot = await getDoc(contactDocRef);
      
      if (contactSnapshot.exists()) {
        setContactInfo(contactSnapshot.data());
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Save message to Firestore 'messages' collection
      const messageData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        subject: formData.subject,
        message: formData.message,
        createdAt: new Date().toISOString(), // NotificationContext expects 'createdAt'
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        status: 'pending', // NotificationContext listens for 'pending' status
        replied: false
      };
      
      await addDoc(collection(db, 'messages'), messageData);
      
      toast.success(isArabic ? 'تم إرسال رسالتك بنجاح!' : 'Votre message a été envoyé avec succès!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(isArabic ? 'حدث خطأ أثناء إرسال الرسالة' : 'Erreur lors de l\'envoi du message');
    } finally {
      setSubmitting(false);
    }
  };

  const defaultContact = {
    phone: '+212 5XX-XXXXXX',
    email: 'contact@lycee-excellence.ma',
    addressFr: 'Avenue Hassan II, Rabat, Maroc',
    addressAr: 'شارع الحسن الثاني، الرباط، المغرب',
    hoursFr: 'Lun - Ven: 8h00 - 17h00',
    hoursAr: 'الإثنين - الجمعة: 8:00 - 17:00',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d106364.27598770895!2d-6.9357142!3d33.9715904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda76b871f50c5c1%3A0x7ac946ed7408076b!2sRabat%2C%20Morocco!5e0!3m2!1sen!2s!4v1234567890'
  };

  const contact = contactInfo || defaultContact;

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
            <EnvelopeIcon className="w-16 h-16 mx-auto mb-6 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isArabic ? 'اتصل بنا' : 'Contactez-Nous'}
            </h1>
            <p className="text-xl text-blue-100">
              {isArabic 
                ? 'نحن هنا للإجابة على أسئلتك وتقديم المساعدة'
                : 'Nous sommes là pour répondre à vos questions et vous aider'}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {isArabic ? 'معلومات الاتصال' : 'Informations de Contact'}
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <PhoneIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {isArabic ? 'الهاتف' : 'Téléphone'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{contact.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <EnvelopeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{contact.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <MapPinIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {isArabic ? 'العنوان' : 'Adresse'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isArabic ? contact.addressAr : contact.addressFr}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {isArabic ? 'ساعات العمل' : 'Horaires'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isArabic ? contact.hoursAr : contact.hoursFr}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-8 h-64 bg-gray-300 dark:bg-gray-700 rounded-xl overflow-hidden">
                {contact.mapUrl ? (
                  <iframe
                    src={contact.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={isArabic ? 'خريطة الموقع' : 'Carte de localisation'}
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <MapPinIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">
                        {isArabic ? 'لم يتم تعيين الخريطة' : 'Carte non configurée'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                {isArabic ? 'أرسل لنا رسالة' : 'Envoyez-nous un Message'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الاسم الكامل' : 'Nom complet'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'رقم الهاتف' : 'Téléphone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الموضوع' : 'Sujet'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {isArabic ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 ${
                    submitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting 
                    ? (isArabic ? 'جاري الإرسال...' : 'Envoi en cours...') 
                    : (isArabic ? 'إرسال الرسالة' : 'Envoyer le Message')
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
