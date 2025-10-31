/**
 * Email Service using EmailJS
 * 
 * This service handles sending emails through EmailJS.
 * Configuration requires EmailJS account and environment variables.
 * 
 * Setup Instructions:
 * 1. Create account at https://www.emailjs.com/
 * 2. Create an email service (Gmail, Outlook, etc.)
 * 3. Create an email template
 * 4. Get your Public Key, Service ID, and Template ID
 * 5. Add them to your .env file
 */

import emailjs from '@emailjs/browser';

// EmailJS Configuration
const EMAILJS_CONFIG = {
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
};

/**
 * Initialize EmailJS with public key
 */
export const initEmailJS = () => {
  if (EMAILJS_CONFIG.publicKey) {
    emailjs.init(EMAILJS_CONFIG.publicKey);
  }
};

/**
 * Check if EmailJS is configured
 * @returns {boolean} True if all required config is present
 */
export const isEmailConfigured = () => {
  return !!(
    EMAILJS_CONFIG.publicKey &&
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.templateId
  );
};

/**
 * Send a reply email to a user
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Recipient email address
 * @param {string} params.toName - Recipient name
 * @param {string} params.subject - Original message subject
 * @param {string} params.originalMessage - The original message sent by user
 * @param {string} params.replyMessage - Admin's reply message
 * @param {string} params.language - Language preference ('fr' or 'ar')
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendReplyEmail = async ({
  toEmail,
  toName,
  subject,
  originalMessage,
  replyMessage,
  language = 'fr'
}) => {
  // Check if EmailJS is configured
  if (!isEmailConfigured()) {
    console.warn('EmailJS is not configured. Email sending is disabled.');
    return {
      success: false,
      message: 'Email service not configured. Please contact administrator.'
    };
  }

  try {
    // Prepare template parameters
    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      subject: subject,
      original_message: originalMessage,
      reply_message: replyMessage,
      language: language,
      
      // Additional metadata
      reply_date: new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      
      // Platform branding
      platform_name: 'Plateforme Éducative Marocaine',
      platform_name_ar: 'المنصة التعليمية المغربية',
      support_email: 'support@edu-platform.ma',
      
      // Greeting and closing based on language
      greeting: language === 'ar' ? `مرحباً ${toName}،` : `Bonjour ${toName},`,
      closing: language === 'ar' 
        ? 'مع أطيب التحيات،\nفريق الدعم' 
        : 'Cordialement,\nL\'équipe de support',
    };

    // Send email via EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('Email sent successfully:', response);

    return {
      success: true,
      message: language === 'ar' 
        ? 'تم إرسال الرد بنجاح إلى البريد الإلكتروني' 
        : 'Réponse envoyée avec succès par email'
    };

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Handle specific error cases
    let errorMessage = language === 'ar' 
      ? 'فشل إرسال البريد الإلكتروني' 
      : 'Échec de l\'envoi de l\'email';

    if (error.text) {
      errorMessage += `: ${error.text}`;
    } else if (error.message) {
      errorMessage += `: ${error.message}`;
    }

    return {
      success: false,
      message: errorMessage,
      error: error
    };
  }
};

/**
 * Send a test email to verify configuration
 * 
 * @param {string} testEmail - Email address to send test to
 * @param {string} language - Language preference
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendTestEmail = async (testEmail, language = 'fr') => {
  return sendReplyEmail({
    toEmail: testEmail,
    toName: 'Test User',
    subject: language === 'ar' ? 'رسالة تجريبية' : 'Message de test',
    originalMessage: language === 'ar' 
      ? 'هذه رسالة تجريبية للتحقق من تكوين البريد الإلكتروني.' 
      : 'Ceci est un message de test pour vérifier la configuration email.',
    replyMessage: language === 'ar'
      ? 'تهانينا! نظام البريد الإلكتروني الخاص بك يعمل بشكل صحيح. ✅'
      : 'Félicitations ! Votre système email fonctionne correctement. ✅',
    language: language
  });
};

/**
 * Get configuration status for debugging
 * @returns {Object} Configuration status
 */
export const getConfigStatus = () => {
  return {
    configured: isEmailConfigured(),
    hasPublicKey: !!EMAILJS_CONFIG.publicKey,
    hasServiceId: !!EMAILJS_CONFIG.serviceId,
    hasTemplateId: !!EMAILJS_CONFIG.templateId,
  };
};

// Initialize EmailJS on module load
initEmailJS();

export default {
  sendReplyEmail,
  sendTestEmail,
  isEmailConfigured,
  getConfigStatus,
  initEmailJS
};
