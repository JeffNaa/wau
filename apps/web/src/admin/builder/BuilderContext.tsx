import { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { BuilderState, BuilderAction, PageLayout } from '@/types/builder';
import {
  addWidgetToColumn,
  moveWidget,
  reorderWidget,
  deleteWidget,
  updateWidgetConfig,
  addSection,
  deleteSection,
  duplicateSection,
  reorderSection,
  updateSection,
  pushHistory,
  undo,
  redo,
  createWidget,
  cloneLayout,
} from '@/lib/builder-utils';

const initialLayout: PageLayout = { sections: [] };

const initialState: BuilderState = {
  page: null,
  layout: initialLayout,
  selectedId: null,
  selectedType: null,
  device: 'desktop',
  history: [cloneLayout(initialLayout)],
  historyIndex: 0,
  isSaving: false,
  hasChanges: false,
};

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'INIT_PAGE': {
      const layout = action.layout;
      return {
        ...state,
        page: action.page,
        layout,
        selectedId: null,
        selectedType: null,
        history: [cloneLayout(layout)],
        historyIndex: 0,
        hasChanges: false,
      };
    }

    case 'SET_LAYOUT': {
      const { history, index } = pushHistory(state.history, action.layout, state.historyIndex);
      return {
        ...state,
        layout: action.layout,
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'ADD_WIDGET': {
      const widget = createWidget(action.widgetType, action.config || {});
      const newLayout = addWidgetToColumn(state.layout, action.sectionId, action.columnId, widget);
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        selectedId: widget.id,
        selectedType: 'widget',
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'MOVE_WIDGET': {
      const newLayout = moveWidget(
        state.layout,
        action.widgetId,
        action.toSectionId,
        action.toColumnId,
        action.toIndex,
      );
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'REORDER_WIDGET': {
      const newLayout = reorderWidget(
        state.layout,
        action.sectionId,
        action.columnId,
        action.oldIndex,
        action.newIndex,
      );
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'UPDATE_WIDGET_CONFIG': {
      const newLayout = updateWidgetConfig(state.layout, action.widgetId, action.config);
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'DELETE_WIDGET': {
      const newLayout = deleteWidget(state.layout, action.widgetId);
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        selectedId: state.selectedId === action.widgetId ? null : state.selectedId,
        selectedType: state.selectedId === action.widgetId ? null : state.selectedType,
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'ADD_SECTION': {
      const { layout: newLayout, sectionId } = addSection(
        state.layout,
        action.afterSectionId,
        action.widgetType,
        action.columnLayout,
      );
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        selectedId: action.widgetType ? null : sectionId,
        selectedType: action.widgetType ? null : 'section',
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'DELETE_SECTION': {
      const newLayout = deleteSection(state.layout, action.sectionId);
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        selectedId: state.selectedId === action.sectionId ? null : state.selectedId,
        selectedType: state.selectedId === action.sectionId ? null : state.selectedType,
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'DUPLICATE_SECTION': {
      const newLayout = duplicateSection(state.layout, action.sectionId);
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'REORDER_SECTION': {
      const newLayout = reorderSection(state.layout, action.oldIndex, action.newIndex);
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'UPDATE_SECTION': {
      const newLayout = updateSection(state.layout, action.sectionId, action.updates);
      const { history, index } = pushHistory(state.history, newLayout, state.historyIndex);
      return {
        ...state,
        layout: newLayout,
        history,
        historyIndex: index,
        hasChanges: true,
      };
    }

    case 'SELECT_COMPONENT': {
      return {
        ...state,
        selectedId: action.id,
        selectedType: action.componentType || null,
      };
    }

    case 'SET_DEVICE': {
      return { ...state, device: action.device };
    }

    case 'UNDO': {
      const result = undo(state.history, state.historyIndex);
      return {
        ...state,
        layout: result.layout,
        historyIndex: result.index,
        hasChanges: result.index !== 0,
      };
    }

    case 'REDO': {
      const result = redo(state.history, state.historyIndex);
      return {
        ...state,
        layout: result.layout,
        historyIndex: result.index,
        hasChanges: result.index !== 0,
      };
    }

    case 'MARK_SAVED': {
      return { ...state, isSaving: false, hasChanges: false };
    }

    case 'MARK_DIRTY': {
      return { ...state, hasChanges: true };
    }

    case 'UPDATE_PAGE_META': {
      if (!state.page) return state;
      return {
        ...state,
        page: { ...state.page, ...action.updates },
        hasChanges: true,
      };
    }

    default:
      return state;
  }
}

const BuilderContext = createContext<{
  state: BuilderState;
  dispatch: React.Dispatch<BuilderAction>;
} | null>(null);

export function BuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(builderReducer, initialState);
  return <BuilderContext.Provider value={{ state, dispatch }}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const context = useContext(BuilderContext);
  if (!context) {
    throw new Error('useBuilder must be used within BuilderProvider');
  }
  return context;
}
