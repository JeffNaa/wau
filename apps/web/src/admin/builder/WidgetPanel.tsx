import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, ChevronDown, Layout, Type, Image, MousePointerClick, Minus, MoveVertical, Images, Grid3x3, Play, Code } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { webApi, type WidgetRegistryItem } from '@/lib/api';
import { Input } from '@/components/ui/input';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Layout,
  Type,
  Image,
  MousePointerClick,
  Minus,
  MoveVertical,
  Images,
  Grid3x3,
  Play,
  Code,
};

function WidgetItem({ widget }: { widget: WidgetRegistryItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `widget-template-${widget.type}`,
    data: { type: 'WIDGET_TEMPLATE', widgetType: widget.type },
  });

  const Icon = widget.icon ? iconMap[widget.icon] || Layout : Layout;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all ${
        isDragging
          ? 'opacity-50 shadow-lg'
          : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[13px] font-medium">{widget.name}</p>
        <p className="text-[11px] text-muted-foreground">{widget.type}</p>
      </div>
    </div>
  );
}

export default function WidgetPanel() {
  const { t } = useTranslation();
  const [widgets, setWidgets] = useState<WidgetRegistryItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  useEffect(() => {
    webApi
      .getAllWidgets()
      .then((data) => setWidgets(data.filter((w) => w.isBuiltIn)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = widgets.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.type.toLowerCase().includes(search.toLowerCase()),
  );

  const categories = [...new Set(filtered.map((w) => w.category))];

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <aside className="w-[260px] border-r border-border bg-card flex flex-col shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold mb-3">{t('pageBuilder.widgets')}</h2>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('pageBuilder.searchWidgets')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-[12px]"
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/20 border-t-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[12px] text-muted-foreground text-center py-8">{t('pageBuilder.noWidgets')}</p>
        ) : (
          <div className="space-y-1">
            {categories.map((category) => (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  <span>{category}</span>
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${collapsed[category] ? '-rotate-90' : ''}`}
                  />
                </button>
                {!collapsed[category] &&
                  filtered
                    .filter((w) => w.category === category)
                    .map((widget) => (
                      <WidgetItem key={widget.type} widget={widget} />
                    ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
