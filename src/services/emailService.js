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
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '', // Default template (for approval)
  contactReplyTemplateId: import.meta.env.VITE_EMAILJS_CONTACT_REPLY_TEMPLATE_ID || '', // Contact reply template
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
  console.log('📧 [sendReplyEmail] Starting...');
  console.log('📧 [sendReplyEmail] To:', toEmail, 'Name:', toName);
  
  // Check if contact reply template is configured
  const hasContactTemplate = !!EMAILJS_CONFIG.contactReplyTemplateId;
  const isBaseConfigured = isEmailConfigured();
  
  console.log('📧 [sendReplyEmail] Config status:', {
    baseConfigured: isBaseConfigured,
    hasContactTemplate,
    contactTemplateId: EMAILJS_CONFIG.contactReplyTemplateId || 'NOT SET'
  });
  
  if (!isBaseConfigured) {
    console.warn('⚠️ [sendReplyEmail] EmailJS is not configured. Email sending is disabled.');
    return {
      success: false,
      message: 'Email service not configured. Please contact administrator.'
    };
  }
  
  // Use contact reply template if available, otherwise use default template
  const templateToUse = hasContactTemplate 
    ? EMAILJS_CONFIG.contactReplyTemplateId 
    : EMAILJS_CONFIG.templateId;
  
  console.log('📧 [sendReplyEmail] Using template:', templateToUse);
  
  if (!hasContactTemplate) {
    console.warn('⚠️ [sendReplyEmail] Contact reply template not configured. Using default template (may not work correctly).');
  }

  try {
    // Prepare template parameters
    const templateParams = {
      // Primary recipient fields
      to_email: toEmail,
      email: toEmail, // For Reply To field
      to_name: toName,
      name: toName, // Alternative name
      
      // Subject and message content
      subject: subject,
      original_message: originalMessage,
      reply_message: replyMessage,
      message: replyMessage, // Alternative message variable
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

    console.log('📧 [sendReplyEmail] Template params:', templateParams);

    // Send email via EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      templateToUse,
      templateParams
    );

    console.log('✅ [sendReplyEmail] Email sent successfully:', response);

    return {
      success: true,
      message: language === 'ar' 
        ? 'تم إرسال الرد بنجاح إلى البريد الإلكتروني' 
        : 'Réponse envoyée avec succès par email'
    };

  } catch (error) {
    console.error('❌ [sendReplyEmail] Error sending email:', error);
    
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
 * Send approval notification email to student
 * 
 * @param {Object} params - Email parameters
 * @param {string} params.toEmail - Student email address
 * @param {string} params.toName - Student name
 * @param {string} params.language - Language preference ('fr' or 'ar')
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendApprovalEmail = async ({
  toEmail,
  toName,
  language = 'fr'
}) => {
  console.log('📧 [sendApprovalEmail] Starting...');
  console.log('📧 [sendApprovalEmail] To:', toEmail, 'Name:', toName, 'Lang:', language);
  
  // Check if EmailJS is configured
  const configured = isEmailConfigured();
  console.log('📧 [sendApprovalEmail] Configuration status:', {
    configured,
    publicKey: !!EMAILJS_CONFIG.publicKey,
    serviceId: !!EMAILJS_CONFIG.serviceId,
    templateId: !!EMAILJS_CONFIG.templateId
  });
  
  if (!configured) {
    console.warn('⚠️ [sendApprovalEmail] EmailJS is not configured. Email sending is disabled.');
    return {
      success: false,
      message: 'Email service not configured.'
    };
  }

  try {
    // Template parameters matching EmailJS template variables
    const templateParams = {
      // Primary recipient fields
      to_email: toEmail,
      email: toEmail, // For Reply To field in template
      to_name: toName,
      name: toName, // Alternative name variable
      
      // Subject line
      subject: language === 'ar' 
        ? 'تم قبول تسجيلك' 
        : 'Votre inscription est approuvée',
      
      // Message content
      message: language === 'ar'
        ? `مرحباً ${toName}،\n\nتم قبول تسجيلك في المنصة التعليمية.\nيمكنك الآن تسجيل الدخول والوصول إلى جميع الدروس.\n\nمع أطيب التحيات،\nفريق المنصة التعليمية`
        : `Bonjour ${toName},\n\nVotre inscription sur la plateforme éducative a été approuvée.\nVous pouvez maintenant vous connecter et accéder à tous les cours.\n\nCordialement,\nL'équipe de la plateforme éducative`,
      
      // Platform branding
      platform_name: 'Plateforme Éducative Marocaine',
      
      // Approval metadata
      approval_date: new Date().toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    console.log('📧 [sendApprovalEmail] Template params:', templateParams);
    console.log('📧 [sendApprovalEmail] Sending via EmailJS...');
    console.log('📧 [sendApprovalEmail] Service:', EMAILJS_CONFIG.serviceId);
    console.log('📧 [sendApprovalEmail] Template:', EMAILJS_CONFIG.templateId);

    // Send email via EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('✅ [sendApprovalEmail] Email sent successfully!');
    console.log('✅ [sendApprovalEmail] Response:', response);

    return {
      success: true,
      message: language === 'ar' 
        ? 'تم إرسال إشعار الموافقة بنجاح' 
        : 'Notification d\'approbation envoyée'
    };

  } catch (error) {
    console.error('❌ [sendApprovalEmail] Error sending approval email:', error);
    console.error('❌ [sendApprovalEmail] Error details:', {
      message: error.message,
      text: error.text,
      status: error.status,
      stack: error.stack
    });
    
    return {
      success: false,
      message: language === 'ar' 
        ? 'فشل إرسال إشعار الموافقة' 
        : 'Échec de l\'envoi de la notification',
      error: error
    };
  }
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
  sendApprovalEmail,
  isEmailConfigured,
  getConfigStatus,
  initEmailJS
};
