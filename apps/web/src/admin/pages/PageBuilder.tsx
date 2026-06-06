import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { webApi, type Page } from '@/lib/api';
import { BuilderProvider, useBuilder } from '@/admin/builder/BuilderContext';
import BuilderToolbar from '@/admin/builder/BuilderToolbar';
import BuilderWorkspace from '@/admin/builder/BuilderWorkspace';

function BuilderContent({ page }: { page: Page }) {
  const { dispatch } = useBuilder();

  useEffect(() => {
    dispatch({
      type: 'INIT_PAGE',
      page: {
        id: page.id,
        slug: page.slug,
        title: page.title,
        status: page.status,
        meta: page.meta || {},
        isHome: page.isHome,
      },
      layout: (page.layout as any) || { sections: [] },
    });
  }, [page.id, dispatch]);

  return (
    <div className="h-screen flex flex-col bg-background">
      <BuilderToolbar page={page} />
      <BuilderWorkspace />
    </div>
  );
}

export default function PageBuilder() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) {
      setError('No page slug provided');
      setLoading(false);
      return;
    }
    webApi
      .getPageBySlug(slug)
      .then((p) => {
        setPage(p);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.response?.data?.message || 'Failed to load page');
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-destructive text-sm mb-3">{error || 'Page not found'}</p>
          <button
            onClick={() => navigate('/admin/pages')}
            className="text-[13px] text-primary hover:underline"
          >
            ← Back to Pages
          </button>
        </div>
      </div>
    );
  }

  return (
    <BuilderProvider>
      <BuilderContent page={page} />
    </BuilderProvider>
  );
}
