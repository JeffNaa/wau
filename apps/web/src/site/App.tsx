import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import ThemeProvider from './components/ThemeProvider';
import Header from './components/Header';
import Footer from './components/Footer';
import PageRenderer from './components/PageRenderer';
import { webApi, type Page } from '@/lib/api';

function PageRoute() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const loadPage = async () => {
      try {
        if (!slug) {
          // Home page — backend already filters for PUBLISHED
          const home = await webApi.getHomePage();
          setPage(home);
        } else {
          const p = await webApi.getPageBySlug(slug);
          // Only show published pages on site
          if (p && p.status === 'PUBLISHED') {
            setPage(p);
          } else {
            setPage(null);
          }
        }
      } catch {
        setPage(null);
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-1.5">Page Not Found</h2>
          <p className="text-[13px] text-muted-foreground">
            The page you're looking for doesn't exist or is not published.
          </p>
        </div>
      </div>
    );
  }

  return <PageRenderer page={page} />;
}

function SiteApp() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<PageRoute />} />
              <Route path="/:slug" element={<PageRoute />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default SiteApp;
