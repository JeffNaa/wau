import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, LayoutTemplate, Navigation, Palette, Eye, Pencil, ArrowUpRight } from 'lucide-react';
import { webApi, type Page, type NavigationItem, type WidgetRegistryItem } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  pages: Page[];
  widgets: WidgetRegistryItem[];
  navigation: NavigationItem[];
  configs: Record<string, any>;
}

function StatCard({ label, value, icon: Icon, href }: { label: string; value: number; icon: any; href?: string }) {
  return (
    <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-muted-foreground font-medium">{label}</p>
            <p className="text-2xl font-semibold tracking-tight mt-1">{value}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
            <Icon size={16} className="text-secondary-foreground" />
          </div>
        </div>
        {href && (
          <a href={href} className="text-[12px] text-muted-foreground hover:text-foreground flex items-center gap-1 mt-4 transition-colors">
            View details <ArrowUpRight size={11} />
          </a>
        )}
      </CardContent>
    </Card>
  );
}

function StatusDistribution({ pages }: { pages: Page[] }) {
  const { t } = useTranslation();
  const published = pages.filter(p => p.status === 'PUBLISHED').length;
  const draft = pages.filter(p => p.status === 'DRAFT').length;
  const total = pages.length || 1;

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-5">{t('dashboard.pageStatus')}</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[13px] mb-2">
              <span className="text-muted-foreground">{t('dashboard.published')}</span>
              <span className="font-medium">{published} <span className="text-muted-foreground font-normal">({Math.round((published / total) * 100)}%)</span></span>
            </div>
            <Progress value={published} max={total} />
          </div>
          <div>
            <div className="flex justify-between text-[13px] mb-2">
              <span className="text-muted-foreground">{t('dashboard.drafts')}</span>
              <span className="font-medium">{draft} <span className="text-muted-foreground font-normal">({Math.round((draft / total) * 100)}%)</span></span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-full flex-1 bg-amber-500 transition-all duration-500" style={{ width: `${(draft / total) * 100}%` }} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentPages({ pages }: { pages: Page[] }) {
  const { t } = useTranslation();
  const recent = [...pages].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t('dashboard.recentPages')}</h3>
            <span className="text-[12px] text-muted-foreground">{t('dashboard.total', { count: pages.length })}</span>
          </div>
        </div>
        <div className="px-2 pb-2">
          {recent.map(page => (
            <div key={page.id} className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-secondary/50 transition-colors">
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate">{page.title}</p>
                <p className="text-[12px] text-muted-foreground">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Badge variant={page.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[11px]">
                  {page.status}
                </Badge>
                {page.isHome && (
                  <Badge variant="outline" className="text-[11px]">Home</Badge>
                )}
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <div className="px-3 py-8 text-center text-[13px] text-muted-foreground">
              {t('dashboard.noPages')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function WidgetCategories({ widgets }: { widgets: WidgetRegistryItem[] }) {
  const { t } = useTranslation();
  const categories = [...new Set(widgets.map(w => w.category))];
  const total = widgets.length || 1;

  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-5">{t('dashboard.widgetCategories')}</h3>
        <div className="space-y-4">
          {categories.map(cat => {
            const count = widgets.filter(w => w.category === cat).length;
            return (
              <div key={cat}>
                <div className="flex justify-between text-[13px] mb-2">
                  <span className="capitalize text-muted-foreground">{cat}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <Progress value={count} max={total} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLinks() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold mb-3">{t('dashboard.quickLinks')}</h3>
        <div className="flex flex-col gap-1">
          <a href="/admin/theme" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Palette size={14} /> {t('dashboard.customizeTheme')}
          </a>
          <a href="/admin/navigation" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Navigation size={14} /> {t('dashboard.editNavigation')}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardHome() {
  const { t } = useTranslation();
  const [data, setData] = useState<DashboardData>({ pages: [], widgets: [], navigation: [], configs: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      webApi.getAllPages(),
      webApi.getAllWidgets(),
      webApi.getNavigation(),
      webApi.getAllConfigs(),
    ])
      .then(([pages, widgets, navigation, configs]) => {
        setData({ pages, widgets, navigation, configs });
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-7 w-32 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  const { pages, widgets, navigation } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">{t('dashboard.subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard label={t('dashboard.pages')} value={pages.length} icon={FileText} href="/admin/pages" />
        <StatCard label={t('dashboard.published')} value={pages.filter(p => p.status === 'PUBLISHED').length} icon={Eye} />
        <StatCard label={t('dashboard.drafts')} value={pages.filter(p => p.status === 'DRAFT').length} icon={Pencil} />
        <StatCard label={t('dashboard.widgets')} value={widgets.length} icon={LayoutTemplate} />
        <StatCard label={t('dashboard.navItems')} value={navigation.length} icon={Navigation} />
        <StatCard label={t('dashboard.configs')} value={Object.keys(data.configs).length} icon={Palette} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StatusDistribution pages={pages} />
          <RecentPages pages={pages} />
        </div>
        <div className="space-y-6">
          <WidgetCategories widgets={widgets} />
          <QuickLinks />
        </div>
      </div>
    </div>
  );
}
