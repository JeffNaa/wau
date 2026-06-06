import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  Trash2,
  GripVertical,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Image as ImageIcon,
} from 'lucide-react';
import { useBuilder } from './BuilderContext';
import type { Section, Column, WidgetInstance } from '@/types/builder';

/* ─── Device width presets ─── */

const deviceWidths: Record<string, string> = {
  desktop: 'w-full max-w-5xl',
  tablet: 'w-[768px]',
  mobile: 'w-[375px]',
};

/* ─── Empty Canvas ─── */

function EmptyCanvas({ onClick }: { onClick: () => void }) {
  return (
    <div
      className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed border-border bg-card hover:border-primary/30 hover:bg-primary/[0.02] transition-colors cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="text-center">
        <Plus size={24} className="mx-auto mb-2 text-muted-foreground" />
        <p className="text-[13px] text-muted-foreground">This page is empty.</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">Click to add a section.</p>
      </div>
    </div>
  );
}

/* ─── Widget Preview (simplified for builder) ─── */

function WidgetPreview({ widget }: { widget: WidgetInstance }) {
  const { config, type } = widget;

  switch (type) {
    case 'wau:hero':
      return (
        <div className="text-center py-8 px-4">
          <h1 className="text-xl font-semibold mb-1">{config?.title || 'Hero Title'}</h1>
          <p className="text-[12px] text-muted-foreground">{config?.subtitle || 'Subtitle'}</p>
          {config?.buttonText && (
            <span className="inline-block mt-3 px-4 py-1.5 rounded-md text-[11px] font-medium bg-primary text-primary-foreground">
              {config.buttonText}
            </span>
          )}
        </div>
      );
    case 'wau:text':
      return (
        <div className="py-2 px-2">
          <p className={`text-[12px] text-muted-foreground text-${config?.align || 'left'}`}>
            {config?.content || 'Text content'}
          </p>
        </div>
      );
    case 'wau:image':
      return (
        <div className="py-2 px-2">
          {config?.src ? (
            <img src={config.src} alt={config?.alt || ''} className="max-w-full h-auto rounded-lg" />
          ) : (
            <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
              <ImageIcon size={20} className="text-muted-foreground" />
            </div>
          )}
        </div>
      );
    case 'wau:button':
      return (
        <div className="py-2 px-2">
          <span className="inline-flex items-center px-4 py-1.5 rounded-md text-[11px] font-medium bg-primary text-primary-foreground">
            {config?.text || 'Button'}
          </span>
        </div>
      );
    default:
      return (
        <div className="py-4 px-4 border border-dashed border-border rounded-lg">
          <p className="text-[11px] text-muted-foreground font-mono">{type}</p>
        </div>
      );
  }
}

/* ─── Sortable Widget ─── */

function SortableWidget({
  widget,
  sectionId,
  columnId,
}: {
  widget: WidgetInstance;
  sectionId: string;
  columnId: string;
}) {
  const { state, dispatch } = useBuilder();
  const isSelected = state.selectedId === widget.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: widget.id,
    data: { type: 'WIDGET', widget, sectionId, columnId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl border transition-all ${
        isSelected
          ? 'border-primary ring-1 ring-primary'
          : 'border-transparent hover:border-border'
      } ${isDragging ? 'opacity-30' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'SELECT_COMPONENT', id: widget.id, componentType: 'widget' });
      }}
    >
      {/* Drag handle + actions */}
      <div
        className={`absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg bg-card border border-border shadow-sm z-10 transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab"
        >
          <GripVertical size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'DELETE_WIDGET', widgetId: widget.id });
          }}
          className="p-0.5 text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <WidgetPreview widget={widget} />
    </div>
  );
}

/* ─── Column ─── */

const colSpanMap: Record<number, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
};

function CanvasColumn({ column, sectionId }: { column: Column; sectionId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${sectionId}-${column.id}`,
    data: { type: 'COLUMN', sectionId, columnId: column.id },
  });

  const spanClass = colSpanMap[column.width] || 'col-span-12';

  return (
    <div className={spanClass}>
      <SortableContext items={column.widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`space-y-2 min-h-[60px] rounded-lg transition-colors ${
            isOver ? 'bg-primary/5 ring-1 ring-primary' : ''
          }`}
        >
          {column.widgets.map((widget) => (
            <SortableWidget
              key={widget.id}
              widget={widget}
              sectionId={sectionId}
              columnId={column.id}
            />
          ))}
          {column.widgets.length === 0 && (
            <div className="h-16 flex items-center justify-center">
              <span className="text-[11px] text-muted-foreground/50">Drop widget here</span>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

/* ─── Section ─── */

function CanvasSection({ section, index }: { section: Section; index: number }) {
  const { state, dispatch } = useBuilder();
  const isSelected = state.selectedId === section.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: section.id,
    data: { type: 'SECTION', section, index },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group rounded-xl border-2 transition-all ${
        isSelected
          ? 'border-primary ring-1 ring-primary'
          : 'border-dashed border-border hover:border-muted-foreground/30'
      } ${isDragging ? 'opacity-30' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        dispatch({ type: 'SELECT_COMPONENT', id: section.id, componentType: 'section' });
      }}
    >
      {/* Section toolbar */}
      <div
        className={`absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-card border border-border shadow-sm z-10 transition-opacity ${
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          {...attributes}
          {...listeners}
          className="p-0.5 text-muted-foreground hover:text-foreground cursor-grab"
        >
          <GripVertical size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Find previous section to insert before current
            const currentIndex = state.layout.sections.findIndex((s: Section) => s.id === section.id);
            const prevSection = state.layout.sections[currentIndex - 1];
            dispatch({ type: 'ADD_SECTION', afterSectionId: prevSection?.id });
          }}
          className="p-0.5 text-muted-foreground hover:text-foreground"
          title="Add section above"
        >
          <ArrowUp size={12} />
        </button>
        <span className="text-[10px] text-muted-foreground px-1">Section {index + 1}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'ADD_SECTION', afterSectionId: section.id });
          }}
          className="p-0.5 text-muted-foreground hover:text-foreground"
          title="Add section below"
        >
          <ArrowDown size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'DUPLICATE_SECTION', sectionId: section.id });
          }}
          className="p-0.5 text-muted-foreground hover:text-foreground"
          title="Duplicate"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'DELETE_SECTION', sectionId: section.id });
          }}
          className="p-0.5 text-muted-foreground hover:text-destructive"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>

      <div
        className="py-6 px-4"
        style={{
          padding: section.padding || '4rem 1rem',
          backgroundColor: section.backgroundColor || 'transparent',
        }}
      >
        <div className={section.fullWidth ? 'w-full' : 'max-w-5xl mx-auto px-4 sm:px-6'}>
          <div className="grid grid-cols-12 gap-4">
            {section.columns.map((column) => (
              <CanvasColumn key={column.id} column={column} sectionId={section.id} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Canvas ─── */

export default function BuilderCanvas() {
  const { t } = useTranslation();
  const { state, dispatch } = useBuilder();
  const { layout, device } = state;

  const widthClass = deviceWidths[device] || deviceWidths.desktop;
  const isDevice = device !== 'desktop';

  /* ─── Keyboard shortcuts ─── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        return;
      }

      // Escape: deselect
      if (e.key === 'Escape') {
        dispatch({ type: 'SELECT_COMPONENT', id: null });
        return;
      }

      // Delete/Backspace: delete selected component
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedType === 'widget' && state.selectedId) {
          dispatch({ type: 'DELETE_WIDGET', widgetId: state.selectedId });
        } else if (state.selectedType === 'section' && state.selectedId) {
          dispatch({ type: 'DELETE_SECTION', sectionId: state.selectedId });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, state.selectedId, state.selectedType]);

  return (
    <main
      className="flex-1 overflow-auto bg-muted/30 flex flex-col items-center p-6"
      onClick={() => dispatch({ type: 'SELECT_COMPONENT', id: null })}
    >
      <div
        className={`${widthClass} transition-all duration-300 space-y-6 min-h-[400px] ${
          isDevice ? 'bg-card rounded-[2rem] shadow-xl border border-border overflow-hidden' : ''
        }`}
      >
        {layout.sections.length === 0 ? (
          <EmptyCanvas onClick={() => dispatch({ type: 'ADD_SECTION' })} />
        ) : (
          <>
            {isDevice && <div className="h-3" />}
            <SortableContext items={layout.sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {layout.sections.map((section, index) => (
                <CanvasSection key={section.id} section={section} index={index} />
              ))}
            </SortableContext>
            {isDevice && <div className="h-3" />}
          </>
        )}

        {/* Add section button at bottom */}
        {layout.sections.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              dispatch({ type: 'ADD_SECTION' });
            }}
            className="w-full py-4 rounded-xl border-2 border-dashed border-border hover:border-muted-foreground/40 transition-colors text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
          >
            <Plus size={14} />
            <span className="text-[12px] font-medium">{t('pageBuilder.addSection')}</span>
          </button>
        )}
      </div>
    </main>
  );
}
