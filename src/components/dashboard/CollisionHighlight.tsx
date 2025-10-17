import { GridItem } from '@/types/dashboard';
import { getRect, checkCollision } from '@/utils/collision';

interface CollisionHighlightProps {
  draggingItem: GridItem | null;
  items: GridItem[];
}

export const CollisionHighlight = ({ draggingItem, items }: CollisionHighlightProps) => {
  if (!draggingItem) return null;

  const draggingRect = getRect(draggingItem);

  return (
    <>
      {items
        .filter((item) => item.id !== draggingItem.id)
        .map((item) => {
          const itemRect = getRect(item);
          if (checkCollision(draggingRect, itemRect)) {
            return (
              <div
                key={`collision-${item.id}`}
                className="absolute border-2 border-red-500/60 rounded-lg pointer-events-none"
                style={{
                  left: item.position.x,
                  top: item.position.y,
                  width: item.size.width,
                  height: item.size.height,
                  zIndex: 50,
                }}
              />
            );
          }
          return null;
        })}
    </>
  );
};
