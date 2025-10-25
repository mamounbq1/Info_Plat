import CMSPageRenderer from '../components/CMSPageRenderer';

export default function TermsPage() {
  return (
    <CMSPageRenderer
      pageId="terms"
      defaultTitle={{ fr: 'Conditions d\'Utilisation', ar: 'شروط الاستخدام' }}
      defaultSubtitle={{ fr: 'Règles et conditions d\'utilisation de la plateforme', ar: 'قواعد وشروط استخدام المنصة' }}
      showBackButton={true}
    />
  );
}
