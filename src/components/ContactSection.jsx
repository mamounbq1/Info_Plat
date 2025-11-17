import React from 'react';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import ContactForm from './ContactForm';

const ContactSection = React.memo(({ contactInfo, isArabic, translations }) => {
  const contact = contactInfo || {
    phone: '+212 5XX-XXXXXX',
    email: 'contact@lycee-excellence.ma',
    addressFr: 'Adresse du Lycée',
    addressAr: 'عنوان الثانوية',
    hoursFr: 'Lun-Ven: 8h-17h',
    hoursAr: 'الاثنين-الجمعة: 8 صباحاً - 5 مساءً',
  };

  return (
    <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <PhoneIcon className="w-5 h-5" />
            {isArabic ? 'اتصل بنا' : 'Contact'}
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {translations.contactTitle}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {translations.contactSubtitle}
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Phone */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-4">
                <PhoneIcon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'الهاتف' : 'Téléphone'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {contact.phone}
              </p>
            </div>

            {/* Email */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center mb-4">
                <EnvelopeIcon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'البريد الإلكتروني' : 'Email'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 break-all">
                {contact.email}
              </p>
            </div>

            {/* Address */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-4">
                <MapPinIcon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'العنوان' : 'Adresse'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {contact[isArabic ? 'addressAr' : 'addressFr']}
              </p>
            </div>

            {/* Hours */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-4">
                <ClockIcon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'ساعات العمل' : 'Horaires'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {contact[isArabic ? 'hoursAr' : 'hoursFr']}
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm isArabic={isArabic} translations={translations} />
          </div>
        </div>
      </div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';

export default ContactSection;
