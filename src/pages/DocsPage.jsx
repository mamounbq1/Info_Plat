import CMSPageRenderer from '../components/CMSPageRenderer';

export default function DocsPage() {
  return (
    <CMSPageRenderer
      pageId="docs"
      defaultTitle={{ fr: 'Documentation', ar: 'التوثيق' }}
      defaultSubtitle={{ fr: 'Guide d\'utilisation de la plateforme', ar: 'دليل استخدام المنصة' }}
      showBackButton={true}
    />
  );
}
