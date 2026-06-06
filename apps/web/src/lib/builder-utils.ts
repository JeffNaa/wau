import type { PageLayout, Section, Column, WidgetInstance } from '@/types/builder';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function createEmptyLayout(): PageLayout {
  return { sections: [] };
}

export function createSection(
  afterSectionId?: string,
  layout: PageLayout = { sections: [] },
  widgetType?: string,
): { layout: PageLayout; sectionId: string; columnId: string } {
  const newSection: Section = {
    id: generateId(),
    padding: '4rem 1rem',
    backgroundColor: 'transparent',
    fullWidth: false,
    columns: [
      {
        id: generateId(),
        width: 12,
        widgets: widgetType ? [createWidget(widgetType)] : [],
      },
    ],
  };

  let newSections: Section[];
  if (!afterSectionId) {
    newSections = [...layout.sections, newSection];
  } else {
    const index = layout.sections.findIndex((s) => s.id === afterSectionId);
    newSections = [...layout.sections];
    newSections.splice(index + 1, 0, newSection);
  }

  return {
    layout: { sections: newSections },
    sectionId: newSection.id,
    columnId: newSection.columns[0].id,
  };
}

export function createWidget(type: string, config: Record<string, any> = {}): WidgetInstance {
  return {
    id: generateId(),
    type,
    config,
  };
}

export function cloneLayout(layout: PageLayout): PageLayout {
  return JSON.parse(JSON.stringify(layout));
}

export function duplicateSection(layout: PageLayout, sectionId: string): PageLayout {
  const newLayout = cloneLayout(layout);
  const index = newLayout.sections.findIndex((s) => s.id === sectionId);
  if (index === -1) return layout;

  const original = newLayout.sections[index];
  const cloned: Section = {
    ...original,
    id: generateId(),
    columns: original.columns.map((col) => ({
      ...col,
      id: generateId(),
      widgets: col.widgets.map((w) => ({
        ...w,
        id: generateId(),
      })),
    })),
  };

  newLayout.sections.splice(index + 1, 0, cloned);
  return newLayout;
}

export function findWidget(layout: PageLayout, widgetId: string): { widget: WidgetInstance | null; sectionId: string | null; columnId: string | null } {
  for (const section of layout.sections) {
    for (const column of section.columns) {
      const widget = column.widgets.find((w) => w.id === widgetId);
      if (widget) {
        return { widget, sectionId: section.id, columnId: column.id };
      }
    }
  }
  return { widget: null, sectionId: null, columnId: null };
}

export function findSection(layout: PageLayout, sectionId: string): Section | undefined {
  return layout.sections.find((s) => s.id === sectionId);
}

export function findColumn(layout: PageLayout, columnId: string): { column: Column | undefined; sectionId: string | null } {
  for (const section of layout.sections) {
    const column = section.columns.find((c) => c.id === columnId);
    if (column) {
      return { column, sectionId: section.id };
    }
  }
  return { column: undefined, sectionId: null };
}

export function addWidgetToColumn(
  layout: PageLayout,
  sectionId: string,
  columnId: string,
  widget: WidgetInstance,
): PageLayout {
  const newLayout = cloneLayout(layout);
  const section = newLayout.sections.find((s) => s.id === sectionId);
  if (!section) return layout;

  const column = section.columns.find((c) => c.id === columnId);
  if (!column) return layout;

  column.widgets.push(widget);
  return newLayout;
}

export function moveWidget(
  layout: PageLayout,
  widgetId: string,
  toSectionId: string,
  toColumnId: string,
  toIndex: number,
): PageLayout {
  const newLayout = cloneLayout(layout);

  // Find and remove widget from source
  let widget: WidgetInstance | undefined;
  for (const section of newLayout.sections) {
    for (const column of section.columns) {
      const index = column.widgets.findIndex((w) => w.id === widgetId);
      if (index !== -1) {
        widget = column.widgets.splice(index, 1)[0];
        break;
      }
    }
    if (widget) break;
  }

  if (!widget) return layout;

  // Insert into destination
  const targetSection = newLayout.sections.find((s) => s.id === toSectionId);
  if (!targetSection) return layout;

  const targetColumn = targetSection.columns.find((c) => c.id === toColumnId);
  if (!targetColumn) return layout;

  targetColumn.widgets.splice(toIndex, 0, widget);
  return newLayout;
}

export function reorderWidget(
  layout: PageLayout,
  sectionId: string,
  columnId: string,
  oldIndex: number,
  newIndex: number,
): PageLayout {
  const newLayout = cloneLayout(layout);
  const section = newLayout.sections.find((s) => s.id === sectionId);
  if (!section) return layout;

  const column = section.columns.find((c) => c.id === columnId);
  if (!column) return layout;

  const [moved] = column.widgets.splice(oldIndex, 1);
  if (!moved) return layout;

  column.widgets.splice(newIndex, 0, moved);
  return newLayout;
}

export function deleteWidget(layout: PageLayout, widgetId: string): PageLayout {
  const newLayout = cloneLayout(layout);
  for (const section of newLayout.sections) {
    for (const column of section.columns) {
      const index = column.widgets.findIndex((w) => w.id === widgetId);
      if (index !== -1) {
        column.widgets.splice(index, 1);
        return newLayout;
      }
    }
  }
  return layout;
}

export function updateWidgetConfig(
  layout: PageLayout,
  widgetId: string,
  config: Record<string, any>,
): PageLayout {
  const newLayout = cloneLayout(layout);
  for (const section of newLayout.sections) {
    for (const column of section.columns) {
      const widget = column.widgets.find((w) => w.id === widgetId);
      if (widget) {
        widget.config = { ...widget.config, ...config };
        return newLayout;
      }
    }
  }
  return layout;
}

export function addSection(layout: PageLayout, afterSectionId?: string, widgetType?: string): { layout: PageLayout; sectionId: string; columnId: string } {
  return createSection(afterSectionId, layout, widgetType);
}

export function deleteSection(layout: PageLayout, sectionId: string): PageLayout {
  return {
    sections: layout.sections.filter((s) => s.id !== sectionId),
  };
}

export function reorderSection(layout: PageLayout, oldIndex: number, newIndex: number): PageLayout {
  const newSections = [...layout.sections];
  const [moved] = newSections.splice(oldIndex, 1);
  if (!moved) return layout;
  newSections.splice(newIndex, 0, moved);
  return { sections: newSections };
}

export function updateSection(layout: PageLayout, sectionId: string, updates: Partial<Section>): PageLayout {
  const newLayout = cloneLayout(layout);
  const section = newLayout.sections.find((s) => s.id === sectionId);
  if (section) {
    Object.assign(section, updates);
  }
  return newLayout;
}

const MAX_HISTORY = 20;

export function pushHistory(history: PageLayout[], layout: PageLayout, index: number): { history: PageLayout[]; index: number } {
  // Remove any future history if we're not at the end
  const newHistory = history.slice(0, index + 1);
  newHistory.push(cloneLayout(layout));

  // Trim to max size
  if (newHistory.length > MAX_HISTORY) {
    newHistory.shift();
    return { history: newHistory, index: MAX_HISTORY - 1 };
  }

  return { history: newHistory, index: newHistory.length - 1 };
}

export function canUndo(_history: PageLayout[], index: number): boolean {
  return index > 0;
}

export function canRedo(history: PageLayout[], index: number): boolean {
  return index < history.length - 1;
}

export function undo(history: PageLayout[], index: number): { layout: PageLayout; index: number } {
  if (!canUndo(history, index)) {
    return { layout: history[index], index };
  }
  const newIndex = index - 1;
  return { layout: cloneLayout(history[newIndex]), index: newIndex };
}

export function redo(history: PageLayout[], index: number): { layout: PageLayout; index: number } {
  if (!canRedo(history, index)) {
    return { layout: history[index], index };
  }
  const newIndex = index + 1;
  return { layout: cloneLayout(history[newIndex]), index: newIndex };
}
