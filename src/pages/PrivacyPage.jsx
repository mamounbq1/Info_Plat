import CMSPageRenderer from '../components/CMSPageRenderer';

export default function PrivacyPage() {
  return (
    <CMSPageRenderer
      pageId="privacy"
      defaultTitle={{ fr: 'Politique de Confidentialité', ar: 'سياسة الخصوصية' }}
      defaultSubtitle={{ fr: 'Protection de vos données personnelles', ar: 'حماية بياناتك الشخصية' }}
      showBackButton={true}
    />
  );
}
