import { useState, useCallback, useEffect } from 'react';
import { Save, RefreshCw, Sparkles, Plus } from 'lucide-react';
import { GridItem, WidgetType, Position, Size } from '@/types/dashboard';
import { GridBackground } from '@/components/dashboard/GridBackground';
import { GuideLines } from '@/components/dashboard/GuideLines';
import { CollisionHighlight } from '@/components/dashboard/CollisionHighlight';
import { DraggableWidget } from '@/components/dashboard/DraggableWidget';
import { AddWidgetMenu } from '@/components/dashboard/AddWidgetMenu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  snap,
  constrainPosition,
  constrainSize,
  resolveCollisions,
  findEmptySpace,
  getSafeArea,
} from '@/utils/collision';

const DEFAULT_ITEMS: GridItem[] = [
  {
    id: 0,
    position: { x: 20, y: 20 },
    size: { width: 300, height: 200 },
    type: WidgetType.PriceChart,
    symbol: 'AAPL',
  },
  {
    id: 1,
    position: { x: 340, y: 20 },
    size: { width: 280, height: 150 },
    type: WidgetType.CompanyInfo,
    symbol: 'AAPL',
  },
  {
    id: 2,
    position: { x: 20, y: 240 },
    size: { width: 300, height: 150 },
    type: WidgetType.VolumeBar,
    symbol: 'AAPL',
  },
  {
    id: 3,
    position: { x: 340, y: 190 },
    size: { width: 280, height: 200 },
    type: WidgetType.Watchlist,
    symbol: 'AAPL',
  },
];

const Index = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<GridItem[]>(DEFAULT_ITEMS);
  const [draggingItem, setDraggingItem] = useState<GridItem | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Position>({ x: 0, y: 0 });
  const [itemStartPos, setItemStartPos] = useState<Position>({ x: 0, y: 0 });
  const [guidePosition, setGuidePosition] = useState<Position | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState<Position | null>(null);

  // Handle drag start
  const handleDragStart = useCallback((id: number, e: React.MouseEvent) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setDraggingItem(item);
    setIsResizing(false);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setItemStartPos(item.position);
    setGuidePosition(item.position);
  }, [items]);

  // Handle drag move
  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingItem || isResizing) return;

      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;

      const potentialPos = {
        x: itemStartPos.x + dx,
        y: itemStartPos.y + dy,
      };

      const constrainedPos = constrainPosition(potentialPos, draggingItem.size);

      setItems((prevItems) => {
        const newItems = prevItems.map((item) =>
          item.id === draggingItem.id
            ? { ...item, position: constrainedPos }
            : item
        );

        const movingItem = newItems.find((i) => i.id === draggingItem.id);
        if (movingItem) {
          resolveCollisions(movingItem, newItems);
        }

        return newItems;
      });

      setGuidePosition(constrainedPos);
    },
    [draggingItem, isResizing, dragStartPos, itemStartPos]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    if (!draggingItem) return;

    setItems((prevItems) => {
      const newItems = prevItems.map((item) => {
        if (item.id === draggingItem.id) {
          const snappedPos = {
            x: snap(item.position.x),
            y: snap(item.position.y),
          };
          const constrainedPos = constrainPosition(snappedPos, item.size);
          return { ...item, position: constrainedPos };
        }
        return item;
      });

      const movingItem = newItems.find((i) => i.id === draggingItem.id);
      if (movingItem) {
        resolveCollisions(movingItem, newItems);
      }

      return newItems;
    });

    setDraggingItem(null);
    setGuidePosition(null);
  }, [draggingItem]);

  // Handle resize start
  const handleResizeStart = useCallback((id: number, e: React.MouseEvent) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    e.stopPropagation();
    setDraggingItem(item);
    setIsResizing(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  }, [items]);

  // Handle resize move
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingItem || !isResizing) return;

      const dx = e.clientX - dragStartPos.x;
      const dy = e.clientY - dragStartPos.y;

      setItems((prevItems) => {
        const newItems = prevItems.map((item) => {
          if (item.id === draggingItem.id) {
            const newSize = {
              width: item.size.width + dx,
              height: item.size.height + dy,
            };
            const constrainedSize = constrainSize(newSize, item.position);
            return { ...item, size: constrainedSize };
          }
          return item;
        });

        const resizingItem = newItems.find((i) => i.id === draggingItem.id);
        if (resizingItem) {
          resolveCollisions(resizingItem, newItems);
        }

        return newItems;
      });

      setDragStartPos({ x: e.clientX, y: e.clientY });
    },
    [draggingItem, isResizing, dragStartPos]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    if (!draggingItem) return;

    setItems((prevItems) => {
      const newItems = prevItems.map((item) => {
        if (item.id === draggingItem.id) {
          const snappedSize = {
            width: snap(item.size.width),
            height: snap(item.size.height),
          };
          return { ...item, size: snappedSize };
        }
        return item;
      });

      const resizingItem = newItems.find((i) => i.id === draggingItem.id);
      if (resizingItem) {
        resolveCollisions(resizingItem, newItems);
      }

      return newItems;
    });

    setDraggingItem(null);
    setIsResizing(false);
  }, [draggingItem]);

  // Mouse move and up listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        handleResizeMove(e);
      } else {
        handleDragMove(e);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        handleResizeEnd();
      } else {
        handleDragEnd();
      }
    };

    if (draggingItem) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingItem, isResizing, handleDragMove, handleDragEnd, handleResizeMove, handleResizeEnd]);

  // Remove widget
  const handleRemove = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Add widget
  const handleAddWidget = useCallback(
    (type: WidgetType, symbol: string) => {
      const defaultSize = getDefaultSizeForType(type);
      const emptyPosition = findEmptySpace(defaultSize, items);

      const newItem: GridItem = {
        id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 0,
        position: emptyPosition,
        size: defaultSize,
        type,
        symbol,
      };

      setItems((prev) => [...prev, newItem]);
      setShowAddMenu(false);
      setAddMenuPosition(null);
    },
    [items]
  );

  // Auto arrange
  const handleAutoArrange = useCallback(() => {
    const safeArea = getSafeArea();
    let x = 20;
    let y = 20;
    const padding = 20;

    const sortedItems = [...items].sort(
      (a, b) => b.size.width * b.size.height - a.size.width * a.size.height
    );

    const newItems = sortedItems.map((item, index) => {
      if (x + item.size.width > safeArea.right - padding) {
        x = 20;
        const maxHeightInRow = Math.max(
          ...sortedItems.slice(0, index).map((i) => i.size.height)
        );
        y += maxHeightInRow + padding;
      }

      if (y + item.size.height > safeArea.bottom - padding) {
        y = 20;
        x = 20;
      }

      const newPosition = constrainPosition(
        { x: snap(x), y: snap(y) },
        item.size
      );

      x += item.size.width + padding;

      return { ...item, position: newPosition };
    });

    setItems(newItems);
    toast({
      title: 'Widgets arranged',
      description: 'All widgets have been automatically arranged',
    });
  }, [items, toast]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* App Bar */}
      <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 relative z-10">
        <h1 className="text-white font-semibold text-lg">Stock Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toast({
                title: 'Layout saved',
                description: 'Your dashboard layout has been saved',
              });
            }}
            className="text-white hover:bg-card-secondary"
          >
            <Save className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toast({
                title: 'Data refreshed',
                description: 'All widget data has been refreshed',
              });
            }}
            className="text-white hover:bg-card-secondary"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAutoArrange}
            className="text-white hover:bg-card-secondary"
          >
            <Sparkles className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative w-full h-[calc(100vh-3.5rem)]">
        <GridBackground />
        <GuideLines position={guidePosition} />
        <CollisionHighlight draggingItem={draggingItem} items={items} />

        {/* Widgets */}
        {items.map((item) => (
          <DraggableWidget
            key={item.id}
            item={item}
            isDragging={draggingItem?.id === item.id && !isResizing}
            isResizing={draggingItem?.id === item.id && isResizing}
            onDragStart={handleDragStart}
            onRemove={handleRemove}
            onResizeStart={handleResizeStart}
          />
        ))}

        {/* Add Widget Button */}
        <button
          onClick={() => {
            setShowAddMenu(true);
            setAddMenuPosition({
              x: window.innerWidth - 320,
              y: window.innerHeight - 300,
            });
          }}
          className="fixed right-5 bottom-5 w-14 h-14 rounded-full bg-success hover:bg-success/90 shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>

        {/* Add Widget Menu */}
        <AddWidgetMenu
          position={addMenuPosition}
          onClose={() => {
            setShowAddMenu(false);
            setAddMenuPosition(null);
          }}
          onAddWidget={handleAddWidget}
        />
      </main>
    </div>
  );
};

function getDefaultSizeForType(type: WidgetType): Size {
  switch (type) {
    case WidgetType.PriceChart:
      return { width: 300, height: 200 };
    case WidgetType.VolumeBar:
      return { width: 300, height: 150 };
    case WidgetType.CompanyInfo:
      return { width: 280, height: 150 };
    case WidgetType.NewsFeed:
      return { width: 320, height: 250 };
    case WidgetType.Watchlist:
      return { width: 280, height: 200 };
    default:
      return { width: 300, height: 200 };
  }
}

export default Index;
