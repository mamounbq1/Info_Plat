import CMSPageRenderer from '../components/CMSPageRenderer';

export default function FAQPage() {
  return (
    <CMSPageRenderer
      pageId="faq"
      defaultTitle={{ fr: 'Questions Fréquentes', ar: 'الأسئلة الشائعة' }}
      defaultSubtitle={{ fr: 'Trouvez les réponses à vos questions', ar: 'ابحث عن إجابات لأسئلتك' }}
      showBackButton={true}
    />
  );
}
