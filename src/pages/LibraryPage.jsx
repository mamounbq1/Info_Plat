import CMSPageRenderer from '../components/CMSPageRenderer';

export default function LibraryPage() {
  return (
    <CMSPageRenderer
      pageId="library"
      defaultTitle={{ fr: 'Bibliothèque', ar: 'المكتبة' }}
      defaultSubtitle={{ fr: 'Ressources et documents pédagogiques', ar: 'الموارد والوثائق التعليمية' }}
      showBackButton={true}
    />
  );
}
