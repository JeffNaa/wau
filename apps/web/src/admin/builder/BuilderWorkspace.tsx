import { useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useBuilder } from './BuilderContext';
import { findColumn } from '@/lib/builder-utils';
import WidgetPanel from './WidgetPanel';
import BuilderCanvas from './BuilderCanvas';
import PropertyPanel from './PropertyPanel';

export default function BuilderWorkspace() {
  const { state, dispatch } = useBuilder();
  const { layout } = state;

  const handleDragStart = useCallback((_event: DragStartEvent) => {
    // Optional: track what's being dragged
  }, []);

  const handleDragOver = useCallback((_event: DragOverEvent) => {
    // Optional: highlight drop targets
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      if (!activeData) return;

      // ─── Widget template from panel ───
      if (activeData.type === 'WIDGET_TEMPLATE') {
        const widgetType = activeData.widgetType as string;

        // Dropped on a column
        if (overData?.type === 'COLUMN') {
          dispatch({
            type: 'ADD_WIDGET',
            sectionId: overData.sectionId,
            columnId: overData.columnId,
            widgetType,
          });
          return;
        }

        // Dropped on a widget — add to that widget's column (append at end)
        if (overData?.type === 'WIDGET') {
          dispatch({
            type: 'ADD_WIDGET',
            sectionId: overData.sectionId,
            columnId: overData.columnId,
            widgetType,
          });
          return;
        }

        // Dropped on empty canvas — add section + widget
        if (layout.sections.length === 0) {
          dispatch({ type: 'ADD_SECTION', widgetType });
          return;
        }

        // Dropped on a section — add new section after it with widget
        if (overData?.type === 'SECTION') {
          dispatch({ type: 'ADD_SECTION', afterSectionId: overData.section.id, widgetType });
          return;
        }
      }

      // ─── Moving existing widget ───
      if (activeData.type === 'WIDGET') {
        // Dropped on another widget
        if (overData?.type === 'WIDGET') {
          const sameColumn =
            activeData.sectionId === overData.sectionId &&
            activeData.columnId === overData.columnId;

          if (sameColumn) {
            // Reorder within same column
            const column = findColumn(layout, activeData.columnId).column;
            if (!column) return;
            const oldIndex = column.widgets.findIndex((w) => w.id === active.id);
            const newIndex = column.widgets.findIndex((w) => w.id === over.id);
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
              dispatch({
                type: 'REORDER_WIDGET',
                sectionId: activeData.sectionId,
                columnId: activeData.columnId,
                oldIndex,
                newIndex,
              });
            }
          } else {
            // Move to different column
            const targetColumn = findColumn(layout, overData.columnId).column;
            if (!targetColumn) return;
            const toIndex = targetColumn.widgets.findIndex((w) => w.id === over.id);
            dispatch({
              type: 'MOVE_WIDGET',
              widgetId: active.id as string,
              toSectionId: overData.sectionId,
              toColumnId: overData.columnId,
              toIndex: toIndex >= 0 ? toIndex : targetColumn.widgets.length,
            });
          }
          return;
        }

        // Dropped on a column (empty or not)
        if (overData?.type === 'COLUMN') {
          const targetColumn = findColumn(layout, overData.columnId).column;
          dispatch({
            type: 'MOVE_WIDGET',
            widgetId: active.id as string,
            toSectionId: overData.sectionId,
            toColumnId: overData.columnId,
            toIndex: targetColumn ? targetColumn.widgets.length : 0,
          });
          return;
        }
      }

      // ─── Reordering sections ───
      if (activeData.type === 'SECTION' && overData?.type === 'SECTION') {
        const oldIndex = layout.sections.findIndex((s) => s.id === active.id);
        const newIndex = layout.sections.findIndex((s) => s.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          dispatch({ type: 'REORDER_SECTION', oldIndex, newIndex });
        }
        return;
      }
    },
    [dispatch, layout],
  );

  return (
    <DndContext onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex-1 flex overflow-hidden">
        <WidgetPanel />
        <BuilderCanvas />
        <PropertyPanel />
      </div>
      <DragOverlay />
    </DndContext>
  );
}
