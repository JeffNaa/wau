/* ─── Builder Types ─── */

export interface WidgetInstance {
  id: string;
  type: string;
  config: Record<string, any>;
}

export interface Column {
  id: string;
  width: number;
  widgets: WidgetInstance[];
}

export interface Section {
  id: string;
  padding?: string;
  backgroundColor?: string;
  fullWidth?: boolean;
  columns: Column[];
}

export interface PageLayout {
  sections: Section[];
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface BuilderState {
  page: {
    id: string;
    slug: string;
    title: string;
    status: 'DRAFT' | 'PUBLISHED';
    meta: Record<string, any>;
    isHome: boolean;
  } | null;
  layout: PageLayout;
  selectedId: string | null;
  selectedType: 'section' | 'column' | 'widget' | null;
  device: DeviceType;
  history: PageLayout[];
  historyIndex: number;
  isSaving: boolean;
  hasChanges: boolean;
}

export type BuilderAction =
  | { type: 'INIT_PAGE'; page: BuilderState['page']; layout: PageLayout }
  | { type: 'SET_LAYOUT'; layout: PageLayout }
  | { type: 'ADD_WIDGET'; sectionId: string; columnId: string; widgetType: string; config?: Record<string, any> }
  | { type: 'MOVE_WIDGET'; widgetId: string; toSectionId: string; toColumnId: string; toIndex: number }
  | { type: 'REORDER_WIDGET'; sectionId: string; columnId: string; oldIndex: number; newIndex: number }
  | { type: 'UPDATE_WIDGET_CONFIG'; widgetId: string; config: Record<string, any> }
  | { type: 'DELETE_WIDGET'; widgetId: string }
  | { type: 'ADD_SECTION'; afterSectionId?: string; widgetType?: string }
  | { type: 'DELETE_SECTION'; sectionId: string }
  | { type: 'DUPLICATE_SECTION'; sectionId: string }
  | { type: 'REORDER_SECTION'; oldIndex: number; newIndex: number }
  | { type: 'UPDATE_SECTION'; sectionId: string; updates: Partial<Section> }
  | { type: 'SELECT_COMPONENT'; id: string | null; componentType?: 'section' | 'column' | 'widget' }
  | { type: 'SET_DEVICE'; device: DeviceType }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'MARK_SAVED' }
  | { type: 'MARK_DIRTY' }
  | { type: 'UPDATE_PAGE_META'; updates: Partial<BuilderState['page']> };
