import { useState, useRef, useEffect } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { GridItem } from '@/types/dashboard';
import { WidgetContent, getWidgetIcon, getWidgetTitle } from './WidgetContent';
import { snap } from '@/utils/collision';

interface DraggableWidgetProps {
  item: GridItem;
  isDragging: boolean;
  isResizing: boolean;
  onDragStart: (id: number, e: React.MouseEvent) => void;
  onRemove: (id: number) => void;
  onResizeStart: (id: number, e: React.MouseEvent) => void;
}

export const DraggableWidget = ({
  item,
  isDragging,
  isResizing,
  onDragStart,
  onRemove,
  onResizeStart,
}: DraggableWidgetProps) => {
  const Icon = getWidgetIcon(item.type);
  const title = getWidgetTitle(item);

  const getHeaderColor = () => {
    if (isDragging) return 'bg-[#0969DA]';
    if (isResizing) return 'bg-warning';
    return 'bg-card-secondary';
  };

  return (
    <div
      className="absolute select-none"
      style={{
        left: item.position.x,
        top: item.position.y,
        width: item.size.width,
        height: item.size.height,
        zIndex: isDragging || isResizing ? 1000 : 1,
        transition: isDragging || isResizing ? 'none' : 'all 0.3s ease-in-out',
      }}
    >
      <div
        className={`w-full h-full rounded-lg overflow-hidden ${
          isDragging ? 'shadow-2xl' : 'shadow-lg'
        }`}
        style={{
          boxShadow: isDragging
            ? '0 10px 40px rgba(0, 0, 0, 0.4)'
            : '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          className={`h-8 ${getHeaderColor()} px-3 flex items-center justify-between cursor-move`}
          onMouseDown={(e) => onDragStart(item.id, e)}
        >
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-medium truncate max-w-[200px]">
              {title}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(item.id);
            }}
            className="w-5 h-5 rounded-full bg-red-500/70 hover:bg-red-500 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Content */}
        <WidgetContent item={item} />

        {/* Resize Handle */}
        <div
          className={`absolute right-0 bottom-0 ${
            isResizing ? 'w-5 h-5 bg-warning' : 'w-4 h-4 bg-primary'
          } rounded-tl cursor-nwse-resize flex items-center justify-center transition-all`}
          onMouseDown={(e) => {
            e.stopPropagation();
            onResizeStart(item.id, e);
          }}
        >
          <Maximize2 className={`${isResizing ? 'w-3 h-3' : 'w-2.5 h-2.5'} text-white`} />
        </div>
      </div>
    </div>
  );
};
