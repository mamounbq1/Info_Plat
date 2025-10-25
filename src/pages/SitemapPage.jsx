import CMSPageRenderer from '../components/CMSPageRenderer';

export default function SitemapPage() {
  return (
    <CMSPageRenderer
      pageId="sitemap"
      defaultTitle={{ fr: 'Plan du Site', ar: 'خريطة الموقع' }}
      defaultSubtitle={{ fr: 'Navigation complète du site', ar: 'التنقل الكامل في الموقع' }}
      showBackButton={true}
    />
  );
}
