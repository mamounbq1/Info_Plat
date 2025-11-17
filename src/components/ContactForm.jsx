import React, { useState, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CheckCircleIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

/**
 * Standalone Contact Form Component
 * Uses uncontrolled inputs with refs to prevent re-render issues
 * Completely isolated from parent component state
 */
export default function ContactForm({ isArabic, translations }) {
  // Use refs for form inputs (uncontrolled components)
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const subjectRef = useRef(null);
  const messageRef = useRef(null);
  
  // Only manage submission state (not form values)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get values from refs
    const name = nameRef.current?.value?.trim() || '';
    const email = emailRef.current?.value?.trim() || '';
    const phone = phoneRef.current?.value?.trim() || '';
    const subject = subjectRef.current?.value?.trim() || '';
    const message = messageRef.current?.value?.trim() || '';
    
    // Validation
    if (!name || !email || !message) {
      alert(isArabic ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Veuillez remplir tous les champs requis');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to Firestore
      await addDoc(collection(db, 'messages'), {
        name,
        email,
        phone,
        subject: subject || (isArabic ? 'رسالة من الصفحة الرئيسية' : 'Message depuis la page d\'accueil'),
        message,
        status: 'pending',
        read: false,
        replied: false,
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        source: 'landing_page'
      });

      // Show success message
      setSubmitSuccess(true);
      
      // Reset form by clearing refs
      if (nameRef.current) nameRef.current.value = '';
      if (emailRef.current) emailRef.current.value = '';
      if (phoneRef.current) phoneRef.current.value = '';
      if (subjectRef.current) subjectRef.current.value = '';
      if (messageRef.current) messageRef.current.value = '';

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);

    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert(isArabic ? 'حدث خطأ أثناء إرسال الرسالة' : 'Erreur lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {translations?.contactForm || (isArabic ? 'نموذج الاتصال' : 'Formulaire de Contact')}
      </h3>
      
      {/* Success Message */}
      {submitSuccess && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
          <p className="text-green-800 dark:text-green-200">
            {isArabic 
              ? 'تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.' 
              : 'Votre message a été envoyé avec succès ! Nous vous contacterons bientôt.'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الاسم *' : 'Nom *'}
            </label>
            <input
              type="text"
              name="name"
              ref={nameRef}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={isArabic ? 'اسمك' : 'Votre nom'}
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'البريد الإلكتروني *' : 'Email *'}
            </label>
            <input
              type="email"
              name="email"
              ref={emailRef}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={isArabic ? 'بريدك الإلكتروني' : 'Votre email'}
              autoComplete="email"
            />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الهاتف' : 'Téléphone'} ({isArabic ? 'اختياري' : 'optionnel'})
            </label>
            <input
              type="tel"
              name="phone"
              ref={phoneRef}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={isArabic ? 'رقم هاتفك' : 'Votre téléphone'}
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isArabic ? 'الموضوع' : 'Sujet'} ({isArabic ? 'اختياري' : 'optionnel'})
            </label>
            <input
              type="text"
              name="subject"
              ref={subjectRef}
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder={isArabic ? 'موضوع الرسالة' : 'Sujet du message'}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {isArabic ? 'الرسالة *' : 'Message *'}
          </label>
          <textarea
            name="message"
            ref={messageRef}
            required
            disabled={isSubmitting}
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={isArabic ? 'رسالتك هنا...' : 'Votre message...'}
          ></textarea>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              {isArabic ? 'جاري الإرسال...' : 'Envoi en cours...'}
            </>
          ) : (
            <>
              {isArabic ? 'إرسال الرسالة' : 'Envoyer le Message'}
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
