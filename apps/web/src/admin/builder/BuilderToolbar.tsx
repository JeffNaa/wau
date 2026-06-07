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
  ChevronDown,
  FileCheck,
  FileX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBuilder } from './BuilderContext';
import { webApi, type Page } from '@/lib/api';
import { canUndo, canRedo } from '@/lib/builder-utils';
import { useState, useRef, useEffect } from 'react';

interface BuilderToolbarProps {
  page: Page;
}

export default function BuilderToolbar({ page }: BuilderToolbarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { state, dispatch } = useBuilder();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const saveMenuRef = useRef<HTMLDivElement>(null);

  const currentStatus = state.page?.status || page.status;

  const handleSave = async (targetStatus?: 'DRAFT' | 'PUBLISHED') => {
    setSaving(true);
    setSaveMenuOpen(false);
    try {
      const status = targetStatus || currentStatus;
      await webApi.updatePage(page.slug, {
        title: state.page?.title || page.title,
        layout: state.layout,
        status,
        meta: state.page?.meta || page.meta,
      });
      // Update page status in state if we changed it
      if (targetStatus && targetStatus !== currentStatus) {
        dispatch({ type: 'UPDATE_PAGE_META', updates: { status: targetStatus } });
      }
      dispatch({ type: 'MARK_SAVED' });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Close save menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target as Node)) {
        setSaveMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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

      {/* Status indicator */}
      {currentStatus === 'PUBLISHED' ? (
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium dark:bg-emerald-950/30 dark:text-emerald-400">
          <FileCheck size={11} />
          Published
        </span>
      ) : (
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-medium dark:bg-amber-950/30 dark:text-amber-400">
          <FileX size={11} />
          Draft
        </span>
      )}

      <div className="w-px h-5 bg-border hidden sm:block" />

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

        {/* Save dropdown */}
        <div className="relative" ref={saveMenuRef}>
          <div className="flex items-center">
            <Button
              size="sm"
              className="gap-1.5 h-8 text-[12px] rounded-r-none pr-2"
              onClick={() => handleSave()}
              disabled={saving}
            >
              <Save size={13} />
              {saving ? t('pageBuilder.saving') : saved ? t('pageBuilder.saved') : t('pageBuilder.save')}
            </Button>
            <Button
              size="sm"
              variant="default"
              className="h-8 px-1.5 rounded-l-none border-l border-primary-foreground/20"
              onClick={() => setSaveMenuOpen(!saveMenuOpen)}
              disabled={saving}
            >
              <ChevronDown size={12} />
            </Button>
          </div>

          {saveMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl border border-border shadow-lg z-50 py-1">
              <button
                onClick={() => handleSave('DRAFT')}
                className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <FileX size={13} />
                Save as Draft
              </button>
              <button
                onClick={() => handleSave('PUBLISHED')}
                className="flex items-center gap-2 w-full px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <FileCheck size={13} />
                Save & Publish
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
