import { useEffect, useState } from 'react';
import { FileText, LayoutGrid, Component, Save } from 'lucide-react';
import { useBuilder } from './BuilderContext';
import { webApi, type WidgetRegistryItem } from '@/lib/api';
import { findWidget, findSection } from '@/lib/builder-utils';
import { Input } from '@/components/ui/input';
import StringField from './fields/StringField';
import TextField from './fields/TextField';
import NumberField from './fields/NumberField';
import BooleanField from './fields/BooleanField';
import SelectField from './fields/SelectField';
import ColorField from './fields/ColorField';
import ImageField from './fields/ImageField';
import LinkField from './fields/LinkField';
import ArrayField from './fields/ArrayField';

function PageProperties() {
  const { state, dispatch } = useBuilder();
  const page = state.page;
  if (!page) return null;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[12px] font-medium mb-1.5 block">Page Title</label>
        <Input
          value={page.title}
          onChange={(e) => dispatch({ type: 'UPDATE_PAGE_META', updates: { title: e.target.value } })}
          className="h-8 text-[13px]"
        />
      </div>
      <div>
        <label className="text-[12px] font-medium mb-1.5 block">Slug</label>
        <Input
          value={page.slug}
          disabled
          className="h-8 text-[13px] bg-muted"
        />
      </div>
      <div>
        <label className="text-[12px] font-medium mb-1.5 block">Status</label>
        <div className="flex gap-2">
          <button
            onClick={() => dispatch({ type: 'UPDATE_PAGE_META', updates: { status: 'DRAFT' } })}
            className={`flex-1 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
              page.status === 'DRAFT'
                ? 'bg-secondary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Draft
          </button>
          <button
            onClick={() => dispatch({ type: 'UPDATE_PAGE_META', updates: { status: 'PUBLISHED' } })}
            className={`flex-1 px-3 py-2 rounded-xl text-[12px] font-medium transition-all ${
              page.status === 'PUBLISHED'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Published
          </button>
        </div>
      </div>
      {page.isHome && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-[12px]">
          <Save size={13} />
          This is the home page
        </div>
      )}
    </div>
  );
}

function SectionProperties() {
  const { state, dispatch } = useBuilder();
  const section = state.selectedId ? findSection(state.layout, state.selectedId) : undefined;
  if (!section) return null;

  return (
    <div className="space-y-4">
      <StringField
        label="Padding"
        value={section.padding || ''}
        onChange={(v) => dispatch({ type: 'UPDATE_SECTION', sectionId: section.id, updates: { padding: v } })}
      />
      <ColorField
        label="Background Color"
        value={section.backgroundColor || 'transparent'}
        onChange={(v) => dispatch({ type: 'UPDATE_SECTION', sectionId: section.id, updates: { backgroundColor: v } })}
      />
      <BooleanField
        label="Full Width"
        value={section.fullWidth}
        onChange={(v) => dispatch({ type: 'UPDATE_SECTION', sectionId: section.id, updates: { fullWidth: v } })}
      />
    </div>
  );
}

function WidgetProperties() {
  const { state, dispatch } = useBuilder();
  const [schema, setSchema] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  const result = state.selectedId ? findWidget(state.layout, state.selectedId) : null;
  const widget = result?.widget;

  useEffect(() => {
    if (!widget) {
      setSchema(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    webApi.getWidgetByType(widget.type)
      .then((w: WidgetRegistryItem) => {
        setSchema(w.configSchema || {});
      })
      .catch(() => setSchema(null))
      .finally(() => setLoading(false));
  }, [widget?.type]);

  if (!widget) return null;

  const handleConfigChange = (key: string, value: any) => {
    dispatch({
      type: 'UPDATE_WIDGET_CONFIG',
      widgetId: widget.id,
      config: { [key]: value },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary/20 border-t-primary" />
      </div>
    );
  }

  if (!schema || Object.keys(schema).length === 0) {
    return <p className="text-[12px] text-muted-foreground">No configurable properties.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50">
        <Component size={13} className="text-muted-foreground" />
        <span className="text-[12px] font-medium">{widget.type}</span>
      </div>
      {Object.entries(schema).map(([key, fieldSchema]: [string, any]) => {
        const value = widget.config?.[key];
        const label = fieldSchema.label || key;

        switch (fieldSchema.type) {
          case 'string':
            return (
              <StringField
                key={key}
                label={label}
                value={value || ''}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
          case 'text':
            return (
              <TextField
                key={key}
                label={label}
                value={value || ''}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
          case 'number':
            return (
              <NumberField
                key={key}
                label={label}
                value={value}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
          case 'boolean':
            return (
              <BooleanField
                key={key}
                label={label}
                value={value}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
          case 'select':
            return (
              <SelectField
                key={key}
                label={label}
                value={value || fieldSchema.options?.[0] || ''}
                options={fieldSchema.options || []}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
          case 'color':
            return (
              <ColorField
                key={key}
                label={label}
                value={value || '#000000'}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
          case 'image':
            return (
              <ImageField
                key={key}
                label={label}
                value={value || ''}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
          case 'link':
            return (
              <LinkField
                key={key}
                label={label}
                value={value || ''}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
          case 'array':
            return (
              <ArrayField
                key={key}
                label={label}
                value={value || []}
                itemSchema={fieldSchema.itemSchema}
                itemType={fieldSchema.itemType}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
          default:
            return (
              <StringField
                key={key}
                label={label}
                value={value || ''}
                onChange={(v) => handleConfigChange(key, v)}
              />
            );
        }
      })}
    </div>
  );
}

export default function PropertyPanel() {
  const { state } = useBuilder();

  const getTitle = () => {
    if (!state.selectedId) return 'Page';
    if (state.selectedType === 'section') return 'Section';
    if (state.selectedType === 'widget') return 'Widget';
    return 'Properties';
  };

  const getIcon = () => {
    if (!state.selectedId) return FileText;
    if (state.selectedType === 'section') return LayoutGrid;
    if (state.selectedType === 'widget') return Component;
    return FileText;
  };

  const Icon = getIcon();

  return (
    <aside className="w-[300px] border-l border-border bg-card flex flex-col shrink-0">
      <div className="p-4 border-b border-border flex items-center gap-2">
        <Icon size={15} className="text-muted-foreground" />
        <h2 className="text-sm font-semibold">{getTitle()}</h2>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {!state.selectedId && <PageProperties />}
        {state.selectedType === 'section' && <SectionProperties />}
        {state.selectedType === 'widget' && <WidgetProperties />}
      </div>
    </aside>
  );
}
