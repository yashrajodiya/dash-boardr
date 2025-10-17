import { GridItem, Rect, Position, Size, WidgetType } from '@/types/dashboard';

export const GRID_SIZE = 20;

export function snap(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE;
}

export function getRect(item: GridItem): Rect {
  return {
    left: item.position.x,
    top: item.position.y,
    right: item.position.x + item.size.width,
    bottom: item.position.y + item.size.height,
    width: item.size.width,
    height: item.size.height,
  };
}

export function checkCollision(rect1: Rect, rect2: Rect): boolean {
  return (
    rect1.left < rect2.right &&
    rect1.right > rect2.left &&
    rect1.top < rect2.bottom &&
    rect1.bottom > rect2.top
  );
}

export function getSafeArea(): Rect {
  return {
    left: 0,
    top: 0,
    right: window.innerWidth,
    bottom: window.innerHeight,
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function constrainPosition(position: Position, size: Size): Position {
  const safeArea = getSafeArea();
  
  let x = position.x;
  let y = position.y;
  
  if (x < safeArea.left) {
    x = safeArea.left;
  } else if (x + size.width > safeArea.right) {
    x = safeArea.right - size.width;
  }
  
  if (y < safeArea.top) {
    y = safeArea.top;
  } else if (y + size.height > safeArea.bottom) {
    y = safeArea.bottom - size.height;
  }
  
  return { x, y };
}

export function constrainSize(currentSize: Size, position: Position): Size {
  const safeArea = getSafeArea();
  
  let width = currentSize.width;
  let height = currentSize.height;
  
  const maxWidth = safeArea.right - position.x;
  if (width > maxWidth) {
    width = maxWidth;
  }
  
  const maxHeight = safeArea.bottom - position.y;
  if (height > maxHeight) {
    height = maxHeight;
  }
  
  width = Math.max(150, width);
  height = Math.max(100, height);
  
  return { width, height };
}

export function resolveCollisions(
  movingItem: GridItem,
  allItems: GridItem[],
  depth: number = 0
): void {
  if (depth > 10) return;
  
  const movingRect = getRect(movingItem);
  const safeArea = getSafeArea();
  
  for (const otherItem of allItems) {
    if (otherItem.id === movingItem.id) continue;
    
    const otherRect = getRect(otherItem);
    
    if (checkCollision(movingRect, otherRect)) {
      const overlapX = Math.min(
        movingRect.right - otherRect.left,
        otherRect.right - movingRect.left
      );
      const overlapY = Math.min(
        movingRect.bottom - otherRect.top,
        otherRect.bottom - movingRect.top
      );
      
      let newPosition: Position | null = null;
      
      if (overlapX < overlapY) {
        if (movingRect.left + movingRect.width / 2 < otherRect.left + otherRect.width / 2) {
          newPosition = { x: snap(movingRect.right), y: otherItem.position.y };
        } else {
          newPosition = { x: snap(movingRect.left - otherRect.width), y: otherItem.position.y };
        }
      } else {
        if (movingRect.top + movingRect.height / 2 < otherRect.top + otherRect.height / 2) {
          newPosition = { x: otherItem.position.x, y: snap(movingRect.bottom) };
        } else {
          newPosition = { x: otherItem.position.x, y: snap(movingRect.top - otherRect.height) };
        }
      }
      
      if (newPosition) {
        newPosition = constrainPosition(newPosition, otherItem.size);
        
        const testRect: Rect = {
          left: newPosition.x,
          top: newPosition.y,
          right: newPosition.x + otherItem.size.width,
          bottom: newPosition.y + otherItem.size.height,
          width: otherItem.size.width,
          height: otherItem.size.height,
        };
        
        let isValid = true;
        for (const item of allItems) {
          if (item.id === otherItem.id || item.id === movingItem.id) continue;
          
          const itemRect = getRect(item);
          if (checkCollision(testRect, itemRect)) {
            isValid = false;
            break;
          }
        }
        
        if (
          testRect.left < safeArea.left ||
          testRect.right > safeArea.right ||
          testRect.top < safeArea.top ||
          testRect.bottom > safeArea.bottom
        ) {
          isValid = false;
        }
        
        if (isValid) {
          otherItem.position = newPosition;
          resolveCollisions(otherItem, allItems, depth + 1);
        }
      }
    }
  }
}

export function findEmptySpace(size: Size, items: GridItem[]): Position {
  const safeArea = getSafeArea();
  
  for (let y = safeArea.top; y <= safeArea.bottom - size.height; y += GRID_SIZE) {
    for (let x = safeArea.left; x <= safeArea.right - size.width; x += GRID_SIZE) {
      const testPosition = { x, y };
      const testItem: GridItem = {
        id: -1,
        position: testPosition,
        size,
        type: WidgetType.PriceChart,
        symbol: '',
      };
      
      if (isValidPosition(testItem, items)) {
        return testPosition;
      }
    }
  }
  
  return { x: safeArea.left + 20, y: safeArea.top + 20 };
}

export function isValidPosition(item: GridItem, allItems: GridItem[]): boolean {
  const itemRect = getRect(item);
  const safeArea = getSafeArea();
  
  if (
    itemRect.left < safeArea.left ||
    itemRect.top < safeArea.top ||
    itemRect.right > safeArea.right ||
    itemRect.bottom > safeArea.bottom
  ) {
    return false;
  }
  
  for (const otherItem of allItems) {
    if (otherItem.id === item.id) continue;
    
    const otherRect = getRect(otherItem);
    if (checkCollision(itemRect, otherRect)) {
      return false;
    }
  }
  
  return true;
}
