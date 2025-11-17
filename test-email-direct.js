/**
 * Test direct de l'envoi d'email d'approbation
 * Ce script teste si EmailJS fonctionne correctement
 */

import fetch from 'node-fetch';

// Configuration EmailJS
const EMAILJS_CONFIG = {
    publicKey: 'cGCZvvD5qBCgFAl9k',
    serviceId: 'service_lcskdxo',
    templateId: 'template_il00l6d'
};

// Email de test
const TEST_EMAIL = {
    toEmail: 'test@example.com', // CHANGEZ CECI avec votre email
    toName: 'Test Student',
    language: 'fr'
};

console.log('🧪 Starting Email Test...\n');
console.log('📧 Configuration:');
console.log('  Public Key:', EMAILJS_CONFIG.publicKey);
console.log('  Service ID:', EMAILJS_CONFIG.serviceId);
console.log('  Template ID:', EMAILJS_CONFIG.templateId);
console.log('\n📬 Recipient:');
console.log('  Email:', TEST_EMAIL.toEmail);
console.log('  Name:', TEST_EMAIL.toName);
console.log('  Language:', TEST_EMAIL.language);
console.log('\n⏳ Sending email...\n');

// Préparer les paramètres du template
const templateParams = {
    to_email: TEST_EMAIL.toEmail,
    to_name: TEST_EMAIL.toName,
    subject: TEST_EMAIL.language === 'ar' 
        ? 'تم قبول تسجيلك' 
        : 'Votre inscription est approuvée',
    message: TEST_EMAIL.language === 'ar'
        ? `مرحباً ${TEST_EMAIL.toName},\n\nتم قبول تسجيلك في المنصة التعليمية.\nيمكنك الآن تسجيل الدخول والوصول إلى جميع الدروس.\n\nمع أطيب التحيات،\nفريق المنصة التعليمية`
        : `Bonjour ${TEST_EMAIL.toName},\n\nVotre inscription sur la plateforme éducative a été approuvée.\nVous pouvez maintenant vous connecter et accéder à tous les cours.\n\nCordialement,\nL'équipe de la plateforme éducative`,
    platform_name: 'Plateforme Éducative Marocaine',
    approval_date: new Date().toLocaleDateString(TEST_EMAIL.language === 'ar' ? 'ar-MA' : 'fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
};

console.log('📋 Template Parameters:');
console.log(JSON.stringify(templateParams, null, 2));
console.log('\n');

// Envoyer l'email via EmailJS REST API
async function sendEmail() {
    try {
        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                service_id: EMAILJS_CONFIG.serviceId,
                template_id: EMAILJS_CONFIG.templateId,
                user_id: EMAILJS_CONFIG.publicKey,
                template_params: templateParams
            })
        });

        console.log('📡 Response Status:', response.status, response.statusText);

        if (response.ok) {
            const text = await response.text();
            console.log('✅ Email sent successfully!');
            console.log('📨 Response:', text || 'OK');
            console.log('\n🎉 SUCCESS! Check your inbox at:', TEST_EMAIL.toEmail);
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ Failed to send email');
            console.error('📄 Error response:', errorText);
            
            // Parse error details
            try {
                const errorJson = JSON.parse(errorText);
                console.error('🔍 Error details:', JSON.stringify(errorJson, null, 2));
            } catch (e) {
                console.error('🔍 Raw error:', errorText);
            }
            
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        console.error('📚 Stack:', error.stack);
        return false;
    }
}

// Exécuter le test
sendEmail().then(success => {
    if (success) {
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
    } else {
        console.log('\n❌ Test failed!');
        console.log('\n🔧 Troubleshooting:');
        console.log('1. Verify EmailJS credentials in Dashboard');
        console.log('2. Check template_il00l6d exists and is configured');
        console.log('3. Verify "To Email" field in template is set to: {{to_email}}');
        console.log('4. Check EmailJS quota (197/200 requests remaining)');
        console.log('5. Verify service is connected and active');
        process.exit(1);
    }
});
