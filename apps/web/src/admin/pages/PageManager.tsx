import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Plus,
  FileText,
  Pencil,
  Trash2,
  Home,
  Search,
  X,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { webApi, type Page } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PageManager() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPublished, setTotalPublished] = useState(0);
  const [totalDrafts, setTotalDrafts] = useState(0);
  const limit = 10;
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', slug: '', status: 'DRAFT' as 'DRAFT' | 'PUBLISHED' });
  const [createLoading, setCreateLoading] = useState(false);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const loadPages = (pageNum = page, searchQuery = search) => {
    setLoading(true);
    webApi
      .getAllPages({ page: pageNum, limit, search: searchQuery || undefined })
      .then((res) => {
        setPages(res.data);
        setTotal(res.total);
        setPage(res.page);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  // Load totals once for tab counts
  useEffect(() => {
    webApi.getAllPages({ limit: 1000 }).then((res) => {
      setTotalPublished(res.data.filter((p) => p.status === 'PUBLISHED').length);
      setTotalDrafts(res.data.filter((p) => p.status === 'DRAFT').length);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    loadPages(1, search);
    setPage(1);
  }, [search]);

  useEffect(() => {
    loadPages(page, search);
  }, [page]);

  const filteredPages = pages.filter((page) => {
    const matchesFilter = filter === 'all' ? true : page.status.toLowerCase() === filter;
    return matchesFilter;
  });

  const totalPages = Math.ceil(total / limit) || 1;

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.slug.trim()) return;
    setCreateLoading(true);
    try {
      await webApi.createPage({
        title: createForm.title,
        slug: createForm.slug,
        status: createForm.status,
        layout: { sections: [] },
      });
      setShowCreate(false);
      setCreateForm({ title: '', slug: '', status: 'DRAFT' });
      loadPages();
      // Navigate to builder
      navigate(`/admin/pages/${createForm.slug}/build`);
    } catch (e: any) {
      alert(e.response?.data?.message || t('pageManager.createError'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    const page = pages.find((p) => p.slug === slug);
    if (page?.isHome) {
      alert(t('pageManager.cannotDeleteHome'));
      return;
    }
    try {
      await webApi.deletePage(slug);
      setDeleteSlug(null);
      loadPages();
    } catch (e: any) {
      alert(e.response?.data?.message || t('pageManager.deleteError'));
    }
  };

  const handleSetHome = async (slug: string) => {
    try {
      await webApi.setHomePage(slug);
      loadPages();
    } catch (e: any) {
      alert(e.response?.data?.message || t('pageManager.setHomeError'));
    }
  };

  const tabs = [
    { id: 'all' as const, label: t('pageManager.all'), count: total },
    { id: 'published' as const, label: t('pageManager.published'), count: totalPublished },
    { id: 'draft' as const, label: t('pageManager.drafts'), count: totalDrafts },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t('pageManager.title')}</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">{t('pageManager.subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-1.5 shrink-0">
          <Plus size={14} />
          {t('pageManager.newPage')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-1 p-1 rounded-2xl bg-secondary/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all ${
                filter === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label} <span className="text-muted-foreground">({tab.count})</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pageManager.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Page List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary/20 border-t-primary" />
        </div>
      ) : filteredPages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText size={24} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-[13px] text-muted-foreground">{t('pageManager.empty')}</p>
            <p className="text-[12px] text-muted-foreground mt-0.5">{t('pageManager.emptyDesc')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPages.map((page) => (
            <Card
              key={page.id}
              className="group hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <FileText size={16} className="text-secondary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-medium truncate">{page.title}</span>
                      <Badge variant={page.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[11px]">
                        {page.status}
                      </Badge>
                      {page.isHome && (
                        <Badge variant="outline" className="text-[11px] gap-0.5">
                          <Home size={10} /> Home
                        </Badge>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[12px] gap-1"
                      onClick={() => navigate(`/admin/pages/${page.slug}/build`)}
                    >
                      <Pencil size={13} /> {t('pageManager.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(`/${page.isHome ? '' : page.slug}`, '_blank')}
                    >
                      <ExternalLink size={13} />
                    </Button>
                    {!page.isHome && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleSetHome(page.slug)}
                        title={t('pageManager.setHome')}
                      >
                        <Home size={13} />
                      </Button>
                    )}
                    {!page.isHome && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteSlug(page.slug)}
                      >
                        <Trash2 size={13} />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`min-w-[32px] px-2 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                p === page
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border hover:bg-secondary'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-lg text-[12px] font-medium border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <Card className="relative w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-1">{t('pageManager.createTitle')}</h2>
              <p className="text-[13px] text-muted-foreground mb-5">{t('pageManager.createSubtitle')}</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block">{t('pageManager.pageTitle')}</label>
                  <Input
                    value={createForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setCreateForm((prev) => ({
                        ...prev,
                        title,
                        slug: prev.slug || slugify(title),
                      }));
                    }}
                    placeholder={t('pageManager.titlePlaceholder')}
                    className="h-9"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block">{t('pageManager.pageSlug')}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[13px]">/</span>
                    <Input
                      value={createForm.slug}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder={t('pageManager.slugPlaceholder')}
                      className="h-9 pl-6"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[12px] font-medium mb-1.5 block">{t('pageManager.status')}</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCreateForm((prev) => ({ ...prev, status: 'DRAFT' }))}
                      className={`flex-1 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
                        createForm.status === 'DRAFT'
                          ? 'bg-secondary text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t('pageManager.draft')}
                    </button>
                    <button
                      onClick={() => setCreateForm((prev) => ({ ...prev, status: 'PUBLISHED' }))}
                      className={`flex-1 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
                        createForm.status === 'PUBLISHED'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t('pageManager.published')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <Button onClick={handleCreate} disabled={createLoading || !createForm.title.trim()} size="sm">
                  {createLoading ? t('pageManager.creating') : t('pageManager.create')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                  {t('pageManager.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteSlug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDeleteSlug(null)} />
          <Card className="relative w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                <AlertTriangle size={18} className="text-destructive" />
              </div>
              <h2 className="text-base font-semibold mb-1">{t('pageManager.deleteTitle')}</h2>
              <p className="text-[13px] text-muted-foreground mb-5">{t('pageManager.deleteSubtitle')}</p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(deleteSlug)}>
                  {t('pageManager.delete')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteSlug(null)}>
                  {t('pageManager.cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
