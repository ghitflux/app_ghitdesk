import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { cn } from '../../lib/utils';

export interface KanbanColumn {
  id: string;
  title: string;
  count?: number;
  color?: string;
}

export interface KanbanItem {
  id: string;
  columnId: string;
  [key: string]: any;
}

export interface KanbanBoardProps<T extends KanbanItem> {
  columns: KanbanColumn[];
  items: T[];
  onMove?: (itemId: string, fromColumn: string, toColumn: string) => void;
  renderItem: (item: T, isDragging?: boolean) => React.ReactNode;
  renderColumn?: (column: KanbanColumn, items: T[]) => React.ReactNode;
  className?: string;
}

export function KanbanBoard<T extends KanbanItem>({
  columns,
  items,
  onMove,
  renderItem,
  renderColumn,
  className,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const itemId = active.id as string;
    const newColumnId = over.id as string;
    const item = items.find((i) => i.id === itemId);

    if (item && item.columnId !== newColumnId && onMove) {
      onMove(itemId, item.columnId, newColumnId);
    }

    setActiveId(null);
  };

  const getItemsByColumn = (columnId: string) => {
    return items.filter((item) => item.columnId === columnId);
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
        {columns.map((column) => {
          const columnItems = getItemsByColumn(column.id);

          if (renderColumn) {
            return (
              <div key={column.id} className="flex-shrink-0 w-80">
                {renderColumn(column, columnItems)}
              </div>
            );
          }

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80 bg-surface rounded-lg border border-border"
            >
              {/* Column Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-text">{column.title}</h3>
                  {column.count !== undefined && (
                    <span className="text-sm text-text-muted bg-background px-2 py-1 rounded-full">
                      {column.count}
                    </span>
                  )}
                </div>
              </div>

              {/* Column Items */}
              <div className="p-4 space-y-3 min-h-[200px]">
                {columnItems.map((item) => (
                  <div key={item.id}>{renderItem(item, item.id === activeId)}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="rotate-3 scale-105 opacity-80">
            {renderItem(activeItem, true)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
