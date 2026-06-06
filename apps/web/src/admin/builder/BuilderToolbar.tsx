import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuilder } from './BuilderContext';
import { webApi, type Page } from '@/lib/api';
import { canUndo, canRedo } from '@/lib/builder-utils';
import { useState } from 'react';

interface BuilderToolbarProps {
  page: Page;
}

export default function BuilderToolbar({ page }: BuilderToolbarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state, dispatch } = useBuilder();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await webApi.updatePage(page.slug, {
        title: state.page?.title || page.title,
        layout: state.layout,
        status: state.page?.status || page.status,
        meta: state.page?.meta || page.meta,
      });
      dispatch({ type: 'MARK_SAVED' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = () => dispatch({ type: 'UNDO' });
  const handleRedo = () => dispatch({ type: 'REDO' });

  const devices = [
    { key: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { key: 'tablet' as const, icon: Tablet, label: 'Tablet' },
    { key: 'mobile' as const, icon: Smartphone, label: 'Mobile' },
  ];

  return (
    <header className="h-14 border-b border-border flex items-center px-4 gap-3 shrink-0 bg-card z-10">
      <button
        onClick={() => navigate('/admin/pages')}
        className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        title={t('pageBuilder.back')}
      >
        <ArrowLeft size={16} />
      </button>

      <div className="w-px h-5 bg-border" />

      <div className="flex items-center gap-2 min-w-0">
        <span className="text-[13px] font-medium truncate">{page.title}</span>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">/{page.slug}</span>
        {state.hasChanges && (
          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" title="Unsaved changes" />
        )}
      </div>

      <div className="flex-1" />

      {/* Device Switcher */}
      <div className="hidden md:flex items-center gap-0.5 p-0.5 rounded-xl bg-secondary/50">
        {devices.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => dispatch({ type: 'SET_DEVICE', device: key })}
            className={`p-1.5 rounded-lg transition-all ${
              state.device === key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={label}
          >
            <Icon size={15} />
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-border hidden md:block" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={handleUndo}
          disabled={!canUndo(state.history, state.historyIndex)}
          className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          title="Undo"
        >
          <Undo2 size={15} />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo(state.history, state.historyIndex)}
          className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
          title="Redo"
        >
          <Redo2 size={15} />
        </button>
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 text-[12px] hidden sm:inline-flex"
          onClick={() => window.open(`/${page.isHome ? '' : page.slug}`, '_blank')}
        >
          <Eye size={13} />
          {t('pageBuilder.preview')}
        </Button>
        <Button
          size="sm"
          className="gap-1.5 h-8 text-[12px]"
          onClick={handleSave}
          disabled={saving || !state.hasChanges}
        >
          <Save size={13} />
          {saving ? t('pageBuilder.saving') : saved ? t('pageBuilder.saved') : t('pageBuilder.save')}
        </Button>
      </div>
    </header>
  );
}
