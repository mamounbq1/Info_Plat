/**
 * Seed script to populate Terms and Privacy pages with comprehensive default content
 * Run this within an authenticated admin component or via Firebase Console
 */

import { db } from './src/config/firebase.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const termsContent = {
  pageId: 'terms',
  title: {
    fr: 'Conditions d\'Utilisation',
    ar: 'شروط الاستخدام'
  },
  subtitle: {
    fr: 'Règles et conditions d\'utilisation de la plateforme',
    ar: 'قواعد وشروط استخدام المنصة'
  },
  metaDescription: {
    fr: 'Consultez les conditions d\'utilisation de notre plateforme éducative. Droits, responsabilités et règles d\'usage pour les utilisateurs.',
    ar: 'اطلع على شروط استخدام منصتنا التعليمية. الحقوق والمسؤوليات وقواعد الاستخدام للمستخدمين.'
  },
  sections: [
    {
      id: '1',
      type: 'text',
      heading: {
        fr: '1. Acceptation des Conditions',
        ar: '1. قبول الشروط'
      },
      content: {
        fr: 'En accédant et en utilisant cette plateforme éducative, vous acceptez d\'être lié par les présentes conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.\n\nCes conditions peuvent être modifiées à tout moment. Il est de votre responsabilité de les consulter régulièrement. Votre utilisation continue de la plateforme après toute modification constitue votre acceptation des nouvelles conditions.',
        ar: 'من خلال الوصول إلى هذه المنصة التعليمية واستخدامها، فإنك توافق على الالتزام بشروط الاستخدام هذه. إذا كنت لا توافق على هذه الشروط، يرجى عدم استخدام المنصة.\n\nقد يتم تعديل هذه الشروط في أي وقت. تقع على عاتقك مسؤولية مراجعتها بانتظام. يشكل استمرارك في استخدام المنصة بعد أي تعديل قبولك للشروط الجديدة.'
      }
    },
    {
      id: '2',
      type: 'text',
      heading: {
        fr: '2. Utilisation de la Plateforme',
        ar: '2. استخدام المنصة'
      },
      content: {
        fr: 'Cette plateforme est destinée à des fins éducatives uniquement. Les utilisateurs s\'engagent à:\n\n• Utiliser la plateforme de manière responsable et éthique\n• Ne pas partager leurs identifiants de connexion avec des tiers\n• Respecter les droits de propriété intellectuelle\n• Ne pas publier de contenu inapproprié, offensant ou illégal\n• Ne pas perturber le fonctionnement de la plateforme\n• Ne pas tenter d\'accéder à des zones non autorisées',
        ar: 'هذه المنصة مخصصة لأغراض تعليمية فقط. يلتزم المستخدمون بـ:\n\n• استخدام المنصة بطريقة مسؤولة وأخلاقية\n• عدم مشاركة بيانات تسجيل الدخول مع الآخرين\n• احترام حقوق الملكية الفكرية\n• عدم نشر محتوى غير لائق أو مسيء أو غير قانوني\n• عدم تعطيل تشغيل المنصة\n• عدم محاولة الوصول إلى مناطق غير مصرح بها'
      }
    },
    {
      id: '3',
      type: 'text',
      heading: {
        fr: '3. Comptes Utilisateurs',
        ar: '3. حسابات المستخدمين'
      },
      content: {
        fr: 'Pour accéder à certaines fonctionnalités, vous devez créer un compte:\n\n• Les informations fournies doivent être exactes et à jour\n• Vous êtes responsable de la confidentialité de votre mot de passe\n• Vous êtes responsable de toutes les activités sur votre compte\n• Vous devez nous informer immédiatement de toute utilisation non autorisée\n• Nous nous réservons le droit de suspendre ou supprimer tout compte en cas de violation des conditions',
        ar: 'للوصول إلى بعض الميزات، يجب عليك إنشاء حساب:\n\n• يجب أن تكون المعلومات المقدمة دقيقة ومحدثة\n• أنت مسؤول عن سرية كلمة المرور الخاصة بك\n• أنت مسؤول عن جميع الأنشطة على حسابك\n• يجب عليك إبلاغنا فوراً بأي استخدام غير مصرح به\n• نحتفظ بالحق في تعليق أو حذف أي حساب في حالة انتهاك الشروط'
      }
    },
    {
      id: '4',
      type: 'text',
      heading: {
        fr: '4. Propriété Intellectuelle',
        ar: '4. الملكية الفكرية'
      },
      content: {
        fr: 'Tout le contenu de la plateforme (textes, images, vidéos, logos, designs) est protégé par les lois sur la propriété intellectuelle:\n\n• Le contenu appartient à l\'établissement ou à ses concédants de licence\n• L\'utilisation du contenu est limitée à un usage personnel et éducatif\n• Toute reproduction, distribution ou modification non autorisée est interdite\n• Vous conservez les droits sur le contenu que vous créez et publiez\n• En publiant du contenu, vous accordez à l\'établissement une licence d\'utilisation',
        ar: 'جميع محتويات المنصة (النصوص والصور ومقاطع الفيديو والشعارات والتصميمات) محمية بموجب قوانين الملكية الفكرية:\n\n• المحتوى ملك للمؤسسة أو مانحي التراخيص\n• استخدام المحتوى مقتصر على الاستخدام الشخصي والتعليمي\n• يُحظر أي نسخ أو توزيع أو تعديل غير مصرح به\n• تحتفظ بحقوق المحتوى الذي تنشئه وتنشره\n• من خلال نشر المحتوى، فإنك تمنح المؤسسة ترخيصاً للاستخدام'
      }
    },
    {
      id: '5',
      type: 'text',
      heading: {
        fr: '5. Limitation de Responsabilité',
        ar: '5. تحديد المسؤولية'
      },
      content: {
        fr: 'Dans les limites permises par la loi:\n\n• La plateforme est fournie "telle quelle" sans garantie d\'aucune sorte\n• Nous ne garantissons pas que la plateforme sera toujours disponible ou sans erreur\n• Nous ne sommes pas responsables des pertes ou dommages résultant de l\'utilisation\n• Nous ne sommes pas responsables du contenu généré par les utilisateurs\n• Nous ne sommes pas responsables des liens vers des sites externes\n• Votre utilisation de la plateforme est à vos propres risques',
        ar: 'ضمن الحدود التي يسمح بها القانون:\n\n• توفَّر المنصة "كما هي" دون ضمان من أي نوع\n• لا نضمن أن المنصة ستكون متاحة دائماً أو خالية من الأخطاء\n• لسنا مسؤولين عن الخسائر أو الأضرار الناتجة عن الاستخدام\n• لسنا مسؤولين عن المحتوى الذي ينشئه المستخدمون\n• لسنا مسؤولين عن الروابط إلى مواقع خارجية\n• استخدامك للمنصة على مسؤوليتك الخاصة'
      }
    },
    {
      id: '6',
      type: 'text',
      heading: {
        fr: '6. Protection des Données',
        ar: '6. حماية البيانات'
      },
      content: {
        fr: 'Nous nous engageons à protéger vos données personnelles:\n\n• Consultez notre Politique de Confidentialité pour plus de détails\n• Vos données ne seront utilisées qu\'à des fins éducatives\n• Nous ne vendrons jamais vos données à des tiers\n• Vous avez le droit d\'accéder, de modifier ou de supprimer vos données\n• Nous utilisons des mesures de sécurité appropriées pour protéger vos données\n• En cas de violation de données, nous vous en informerons rapidement',
        ar: 'نلتزم بحماية بياناتك الشخصية:\n\n• راجع سياسة الخصوصية الخاصة بنا لمزيد من التفاصيل\n• لن تُستخدم بياناتك إلا للأغراض التعليمية\n• لن نبيع بياناتك أبداً لأطراف ثالثة\n• لديك الحق في الوصول إلى بياناتك أو تعديلها أو حذفها\n• نستخدم إجراءات أمنية مناسبة لحماية بياناتك\n• في حالة انتهاك البيانات، سنخطرك على الفور'
      }
    },
    {
      id: '7',
      type: 'text',
      heading: {
        fr: '7. Résiliation',
        ar: '7. الإنهاء'
      },
      content: {
        fr: 'Nous nous réservons le droit de:\n\n• Suspendre ou résilier votre accès à tout moment, avec ou sans préavis\n• Supprimer tout contenu qui viole ces conditions\n• Modifier ou interrompre tout ou partie de la plateforme\n• Refuser l\'accès à toute personne pour quelque raison que ce soit\n\nVous pouvez également résilier votre compte à tout moment en nous contactant.',
        ar: 'نحتفظ بالحق في:\n\n• تعليق أو إنهاء وصولك في أي وقت، مع أو بدون إشعار مسبق\n• حذف أي محتوى ينتهك هذه الشروط\n• تعديل أو مقاطعة كل أو جزء من المنصة\n• رفض الوصول لأي شخص لأي سبب من الأسباب\n\nيمكنك أيضاً إنهاء حسابك في أي وقت عن طريق الاتصال بنا.'
      }
    },
    {
      id: '8',
      type: 'text',
      heading: {
        fr: '8. Loi Applicable et Juridiction',
        ar: '8. القانون الساري والاختصاص القضائي'
      },
      content: {
        fr: 'Ces conditions sont régies par les lois du Maroc:\n\n• Tout litige sera soumis à la juridiction exclusive des tribunaux marocains\n• Les présentes conditions constituent l\'intégralité de l\'accord entre vous et nous\n• Si une disposition est jugée invalide, les autres dispositions resteront en vigueur\n• Notre échec à faire respecter un droit ne constitue pas une renonciation à ce droit',
        ar: 'تخضع هذه الشروط لقوانين المغرب:\n\n• سيتم إحالة أي نزاع إلى الاختصاص الحصري للمحاكم المغربية\n• تشكل هذه الشروط الاتفاقية الكاملة بينك وبيننا\n• إذا تبين أن أي بند غير صالح، فستظل الأحكام الأخرى سارية\n• عدم إنفاذنا لحق ما لا يشكل تنازلاً عن هذا الحق'
      }
    },
    {
      id: '9',
      type: 'text',
      heading: {
        fr: '9. Contact',
        ar: '9. اتصل بنا'
      },
      content: {
        fr: 'Pour toute question concernant ces conditions d\'utilisation:\n\n• Consultez notre page de contact\n• Envoyez-nous un email à l\'adresse indiquée\n• Contactez l\'administration de l\'établissement\n\nNous nous efforcerons de répondre à vos questions dans les plus brefs délais.\n\nDernière mise à jour: ' + new Date().toLocaleDateString('fr-FR'),
        ar: 'لأي سؤال بخصوص شروط الاستخدام هذه:\n\n• راجع صفحة الاتصال الخاصة بنا\n• أرسل لنا بريداً إلكترونياً على العنوان المشار إليه\n• اتصل بإدارة المؤسسة\n\nسنبذل قصارى جهدنا للإجابة على أسئلتك في أقرب وقت ممكن.\n\nآخر تحديث: ' + new Date().toLocaleDateString('ar-MA')
      }
    }
  ],
  isPublished: true,
  lastModified: serverTimestamp()
};

const privacyContent = {
  pageId: 'privacy',
  title: {
    fr: 'Politique de Confidentialité',
    ar: 'سياسة الخصوصية'
  },
  subtitle: {
    fr: 'Protection de vos données personnelles et respect de votre vie privée',
    ar: 'حماية بياناتك الشخصية واحترام خصوصيتك'
  },
  metaDescription: {
    fr: 'Découvrez comment nous protégeons vos données personnelles et respectons votre vie privée sur notre plateforme éducative.',
    ar: 'اكتشف كيف نحمي بياناتك الشخصية ونحترم خصوصيتك على منصتنا التعليمية.'
  },
  sections: [
    {
      id: '1',
      type: 'text',
      heading: {
        fr: '1. Introduction',
        ar: '1. مقدمة'
      },
      content: {
        fr: 'Nous attachons une grande importance à la protection de vos données personnelles et au respect de votre vie privée. Cette politique de confidentialité explique:\n\n• Quelles données nous collectons\n• Comment nous les utilisons\n• Avec qui nous les partageons\n• Comment nous les protégeons\n• Vos droits concernant vos données\n\nEn utilisant notre plateforme, vous acceptez les pratiques décrites dans cette politique.',
        ar: 'نولي أهمية كبيرة لحماية بياناتك الشخصية واحترام خصوصيتك. توضح سياسة الخصوصية هذه:\n\n• البيانات التي نجمعها\n• كيف نستخدمها\n• مع من نشاركها\n• كيف نحميها\n• حقوقك المتعلقة ببياناتك\n\nباستخدام منصتنا، فإنك توافق على الممارسات الموضحة في هذه السياسة.'
      }
    },
    {
      id: '2',
      type: 'text',
      heading: {
        fr: '2. Données Collectées',
        ar: '2. البيانات المجمعة'
      },
      content: {
        fr: 'Nous collectons différents types de données:\n\n📝 Données d\'identification:\n• Nom complet\n• Adresse email\n• Niveau et classe scolaire\n• Numéro de téléphone (optionnel)\n\n📊 Données d\'utilisation:\n• Historique de navigation sur la plateforme\n• Résultats aux quiz et exercices\n• Progression dans les cours\n• Participation aux activités\n\n🔧 Données techniques:\n• Adresse IP\n• Type de navigateur\n• Système d\'exploitation\n• Données de connexion (date, heure)',
        ar: 'نجمع أنواعاً مختلفة من البيانات:\n\n📝 بيانات التعريف:\n• الاسم الكامل\n• البريد الإلكتروني\n• المستوى والصف الدراسي\n• رقم الهاتف (اختياري)\n\n📊 بيانات الاستخدام:\n• سجل التصفح على المنصة\n• نتائج الاختبارات والتمارين\n• التقدم في الدورات\n• المشاركة في الأنشطة\n\n🔧 البيانات التقنية:\n• عنوان IP\n• نوع المتصفح\n• نظام التشغيل\n• بيانات الاتصال (التاريخ والوقت)'
      }
    },
    {
      id: '3',
      type: 'text',
      heading: {
        fr: '3. Utilisation des Données',
        ar: '3. استخدام البيانات'
      },
      content: {
        fr: 'Vos données sont utilisées pour:\n\n🎓 Finalités éducatives:\n• Fournir l\'accès aux cours et ressources\n• Suivre votre progression académique\n• Évaluer vos performances\n• Personnaliser votre expérience d\'apprentissage\n\n📧 Communication:\n• Vous envoyer des notifications importantes\n• Répondre à vos questions et demandes\n• Vous informer des nouveautés et événements\n\n🔒 Sécurité et conformité:\n• Protéger contre la fraude et les abus\n• Respecter les obligations légales\n• Améliorer la sécurité de la plateforme',
        ar: 'تُستخدم بياناتك من أجل:\n\n🎓 الأغراض التعليمية:\n• توفير الوصول إلى الدورات والموارد\n• تتبع تقدمك الأكاديمي\n• تقييم أدائك\n• تخصيص تجربة التعلم الخاصة بك\n\n📧 التواصل:\n• إرسال إشعارات مهمة لك\n• الإجابة على أسئلتك وطلباتك\n• إعلامك بالأخبار والفعاليات\n\n🔒 الأمن والامتثال:\n• الحماية من الاحتيال والإساءة\n• احترام الالتزامات القانونية\n• تحسين أمان المنصة'
      }
    },
    {
      id: '4',
      type: 'text',
      heading: {
        fr: '4. Partage des Données',
        ar: '4. مشاركة البيانات'
      },
      content: {
        fr: 'Nous ne vendons jamais vos données. Nous les partageons uniquement:\n\n👥 Au sein de l\'établissement:\n• Avec les enseignants (données académiques uniquement)\n• Avec l\'administration (pour la gestion académique)\n• Avec le personnel autorisé (support technique)\n\n🔧 Avec des prestataires de services:\n• Hébergement et stockage de données (Firebase, Google Cloud)\n• Services d\'analyse (Google Analytics - anonymisé)\n• Services de communication (emails, notifications)\n\n⚖️ Pour des obligations légales:\n• Sur demande d\'autorités compétentes\n• Pour protéger nos droits et notre sécurité\n• En cas de fusion ou acquisition de l\'établissement',
        ar: 'نحن لا نبيع بياناتك أبداً. نشاركها فقط:\n\n👥 داخل المؤسسة:\n• مع المعلمين (البيانات الأكاديمية فقط)\n• مع الإدارة (للإدارة الأكاديمية)\n• مع الموظفين المصرح لهم (الدعم الفني)\n\n🔧 مع مقدمي الخدمات:\n• استضافة وتخزين البيانات (Firebase، Google Cloud)\n• خدمات التحليل (Google Analytics - مجهول)\n• خدمات الاتصال (البريد الإلكتروني، الإشعارات)\n\n⚖️ للالتزامات القانونية:\n• بناءً على طلب السلطات المختصة\n• لحماية حقوقنا وسلامتنا\n• في حالة دمج أو استحواذ المؤسسة'
      }
    },
    {
      id: '5',
      type: 'text',
      heading: {
        fr: '5. Sécurité des Données',
        ar: '5. أمن البيانات'
      },
      content: {
        fr: 'Nous mettons en œuvre des mesures de sécurité robustes:\n\n🔐 Mesures techniques:\n• Chiffrement des données sensibles (SSL/TLS)\n• Authentification sécurisée (Firebase Auth)\n• Contrôles d\'accès stricts\n• Surveillance continue des menaces\n• Sauvegardes régulières\n\n👥 Mesures organisationnelles:\n• Formation du personnel sur la protection des données\n• Limitation de l\'accès aux données (principe du moindre privilège)\n• Audits de sécurité réguliers\n• Protocoles de réponse aux incidents\n\nAucun système n\'est totalement sécurisé. Nous vous recommandons de protéger votre mot de passe.',
        ar: 'نطبق إجراءات أمنية قوية:\n\n🔐 الإجراءات التقنية:\n• تشفير البيانات الحساسة (SSL/TLS)\n• مصادقة آمنة (Firebase Auth)\n• ضوابط وصول صارمة\n• مراقبة مستمرة للتهديدات\n• نسخ احتياطية منتظمة\n\n👥 الإجراءات التنظيمية:\n• تدريب الموظفين على حماية البيانات\n• تقييد الوصول إلى البيانات (مبدأ الامتياز الأدنى)\n• تدقيقات أمنية منتظمة\n• بروتوكولات الاستجابة للحوادث\n\nلا يوجد نظام آمن تماماً. نوصيك بحماية كلمة المرور الخاصة بك.'
      }
    },
    {
      id: '6',
      type: 'text',
      heading: {
        fr: '6. Vos Droits',
        ar: '6. حقوقك'
      },
      content: {
        fr: 'Vous disposez de plusieurs droits concernant vos données:\n\n✅ Droit d\'accès:\n• Demander une copie de vos données personnelles\n• Savoir comment nous utilisons vos données\n\n✏️ Droit de rectification:\n• Corriger des données inexactes ou incomplètes\n• Mettre à jour vos informations personnelles\n\n🗑️ Droit à l\'effacement:\n• Demander la suppression de vos données\n• Exception: données nécessaires pour obligations légales\n\n⛔ Droit d\'opposition:\n• Vous opposer au traitement de vos données\n• Retirer votre consentement à tout moment\n\nPour exercer ces droits, contactez-nous via la page de contact.',
        ar: 'لديك عدة حقوق تتعلق ببياناتك:\n\n✅ حق الوصول:\n• طلب نسخة من بياناتك الشخصية\n• معرفة كيف نستخدم بياناتك\n\n✏️ حق التصحيح:\n• تصحيح البيانات غير الدقيقة أو غير الكاملة\n• تحديث معلوماتك الشخصية\n\n🗑️ حق المحو:\n• طلب حذف بياناتك\n• استثناء: البيانات الضرورية للالتزامات القانونية\n\n⛔ حق الاعتراض:\n• الاعتراض على معالجة بياناتك\n• سحب موافقتك في أي وقت\n\nلممارسة هذه الحقوق، اتصل بنا عبر صفحة الاتصال.'
      }
    },
    {
      id: '7',
      type: 'text',
      heading: {
        fr: '7. Cookies et Technologies Similaires',
        ar: '7. ملفات تعريف الارتباط والتقنيات المماثلة'
      },
      content: {
        fr: 'Nous utilisons des cookies et technologies similaires:\n\n🍪 Cookies essentiels:\n• Nécessaires au fonctionnement de la plateforme\n• Gestion des sessions et authentification\n• Ne peuvent pas être désactivés\n\n📊 Cookies analytiques:\n• Comprendre comment vous utilisez la plateforme\n• Améliorer nos services\n• Peuvent être désactivés dans les paramètres\n\n⚙️ Cookies de préférence:\n• Mémoriser vos choix (langue, thème)\n• Personnaliser votre expérience\n\nVous pouvez gérer les cookies dans les paramètres de votre navigateur.',
        ar: 'نستخدم ملفات تعريف الارتباط والتقنيات المماثلة:\n\n🍪 ملفات تعريف ارتباط أساسية:\n• ضرورية لتشغيل المنصة\n• إدارة الجلسات والمصادقة\n• لا يمكن تعطيلها\n\n📊 ملفات تعريف ارتباط تحليلية:\n• فهم كيفية استخدامك للمنصة\n• تحسين خدماتنا\n• يمكن تعطيلها في الإعدادات\n\n⚙️ ملفات تعريف ارتباط التفضيلات:\n• تذكر اختياراتك (اللغة، السمة)\n• تخصيص تجربتك\n\nيمكنك إدارة ملفات تعريف الارتباط في إعدادات المتصفح الخاص بك.'
      }
    },
    {
      id: '8',
      type: 'text',
      heading: {
        fr: '8. Protection des Mineurs',
        ar: '8. حماية القصر'
      },
      content: {
        fr: 'Nous prenons la protection des mineurs très au sérieux:\n\n👶 Pour les utilisateurs mineurs:\n• Le consentement parental peut être requis\n• Restrictions d\'accès à certaines fonctionnalités\n• Supervision appropriée recommandée\n• Traitement des données limité au strict nécessaire\n\n👨‍👩‍👧 Rôle des parents/tuteurs:\n• Peuvent demander l\'accès aux données de l\'enfant\n• Peuvent demander la rectification ou l\'effacement\n• Doivent superviser l\'utilisation de la plateforme\n• Peuvent contacter l\'établissement pour toute préoccupation',
        ar: 'نأخذ حماية القصر على محمل الجد:\n\n👶 للمستخدمين القصر:\n• قد تكون موافقة الوالدين مطلوبة\n• قيود على الوصول إلى بعض الميزات\n• يوصى بالإشراف المناسب\n• معالجة البيانات محدودة بما هو ضروري للغاية\n\n👨‍👩‍👧 دور الآباء/الأوصياء:\n• يمكنهم طلب الوصول إلى بيانات الطفل\n• يمكنهم طلب التصحيح أو المحو\n• يجب عليهم الإشراف على استخدام المنصة\n• يمكنهم الاتصال بالمؤسسة لأي قلق'
      }
    },
    {
      id: '9',
      type: 'text',
      heading: {
        fr: '9. Conservation des Données',
        ar: '9. الاحتفاظ بالبيانات'
      },
      content: {
        fr: 'Nous conservons vos données selon les principes suivants:\n\n⏰ Durées de conservation:\n• Données de compte: pendant la durée de votre scolarité + 1 an\n• Résultats académiques: conservés conformément aux exigences légales\n• Données de connexion: 12 mois maximum\n• Données analytiques: anonymisées après 24 mois\n\n🗑️ Suppression automatique:\n• Comptes inactifs depuis 3 ans\n• Données temporaires après utilisation\n• Données non nécessaires périodiquement\n\nPour demander la suppression anticipée, contactez-nous.',
        ar: 'نحتفظ ببياناتك وفقاً للمبادئ التالية:\n\n⏰ فترات الاحتفاظ:\n• بيانات الحساب: طوال فترة دراستك + سنة واحدة\n• النتائج الأكاديمية: محفوظة وفقاً للمتطلبات القانونية\n• بيانات الاتصال: 12 شهراً كحد أقصى\n• البيانات التحليلية: مجهولة المصدر بعد 24 شهراً\n\n🗑️ الحذف التلقائي:\n• الحسابات غير النشطة لمدة 3 سنوات\n• البيانات المؤقتة بعد الاستخدام\n• البيانات غير الضرورية بشكل دوري\n\nلطلب الحذف المبكر، اتصل بنا.'
      }
    },
    {
      id: '10',
      type: 'text',
      heading: {
        fr: '10. Modifications de la Politique',
        ar: '10. تعديلات السياسة'
      },
      content: {
        fr: 'Nous pouvons modifier cette politique de confidentialité:\n\n📢 Notification des changements:\n• Vous serez informé par email\n• Notification sur la plateforme\n• Publication de la date de mise à jour\n\n✅ Votre consentement:\n• Les changements majeurs nécessitent votre consentement explicite\n• Continuer à utiliser la plateforme implique l\'acceptation des changements mineurs\n• Vous pouvez toujours nous contacter pour des questions\n\nDernière mise à jour: ' + new Date().toLocaleDateString('fr-FR') + '\n\nPour toute question concernant cette politique, contactez-nous via la page de contact.',
        ar: 'يمكننا تعديل سياسة الخصوصية هذه:\n\n📢 إخطار التغييرات:\n• ستتلقى إشعاراً عبر البريد الإلكتروني\n• إشعار على المنصة\n• نشر تاريخ التحديث\n\n✅ موافقتك:\n• التغييرات الرئيسية تتطلب موافقتك الصريحة\n• الاستمرار في استخدام المنصة يعني قبول التغييرات البسيطة\n• يمكنك دائماً الاتصال بنا للأسئلة\n\nآخر تحديث: ' + new Date().toLocaleDateString('ar-MA') + '\n\nلأي سؤال بخصوص هذه السياسة، اتصل بنا عبر صفحة الاتصال.'
      }
    }
  ],
  isPublished: true,
  lastModified: serverTimestamp()
};

export async function seedTermsAndPrivacy() {
  try {
    console.log('🌱 Seeding Terms and Privacy pages...');
    
    // Seed Terms page
    const termsRef = doc(db, 'pageContents', 'terms');
    await setDoc(termsRef, termsContent);
    console.log('✅ Terms page seeded successfully');
    
    // Seed Privacy page
    const privacyRef = doc(db, 'pageContents', 'privacy');
    await setDoc(privacyRef, privacyContent);
    console.log('✅ Privacy page seeded successfully');
    
    console.log('🎉 All pages seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('❌ Error seeding pages:', error);
    return { success: false, error };
  }
}

// Export content for use in React component
export { termsContent, privacyContent };
