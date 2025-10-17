import { Position } from '@/types/dashboard';

interface GuideLinesProps {
  position: Position | null;
}

export const GuideLines = ({ position }: GuideLinesProps) => {
  if (!position) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }}>
      {/* Vertical line */}
      <div
        className="absolute top-0 bottom-0 w-px bg-primary/50"
        style={{ left: position.x }}
      />
      {/* Horizontal line */}
      <div
        className="absolute left-0 right-0 h-px bg-primary/50"
        style={{ top: position.y }}
      />
      {/* Center dot */}
      <div
        className="absolute w-1.5 h-1.5 bg-primary rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ left: position.x, top: position.y }}
      />
    </div>
  );
};
