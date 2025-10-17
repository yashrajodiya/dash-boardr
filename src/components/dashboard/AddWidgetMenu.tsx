import { WidgetType } from '@/types/dashboard';
import { getWidgetIcon } from './WidgetContent';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AddWidgetMenuProps {
  position: { x: number; y: number } | null;
  onClose: () => void;
  onAddWidget: (type: WidgetType, symbol: string) => void;
}

const STOCK_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM'];

const WIDGET_OPTIONS = [
  { type: WidgetType.PriceChart, title: 'Price Chart' },
  { type: WidgetType.VolumeBar, title: 'Volume Bar' },
  { type: WidgetType.CompanyInfo, title: 'Company Info' },
  { type: WidgetType.NewsFeed, title: 'News Feed' },
  { type: WidgetType.Watchlist, title: 'Watchlist' },
];

export const AddWidgetMenu = ({ position, onClose, onAddWidget }: AddWidgetMenuProps) => {
  if (!position) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[999]"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className="fixed z-[1000] bg-card-secondary rounded-lg shadow-2xl p-2"
        style={{
          left: Math.min(position.x, window.innerWidth - 220),
          top: Math.min(position.y, window.innerHeight - 300),
          width: 200,
        }}
      >
        <div className="px-3 py-2 mb-1">
          <h3 className="text-white font-semibold text-sm">Add Widget</h3>
        </div>

        <div className="space-y-1">
          {WIDGET_OPTIONS.map((option) => {
            const Icon = getWidgetIcon(option.type);

            return (
              <DropdownMenu key={option.type}>
                <DropdownMenuTrigger asChild>
                  <button className="w-full px-3 py-2 rounded bg-card-tertiary hover:bg-card-tertiary/80 flex items-center justify-between text-white text-sm transition-colors">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{option.title}</span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-card-secondary border-border">
                  {STOCK_SYMBOLS.map((symbol) => (
                    <DropdownMenuItem
                      key={symbol}
                      onClick={() => onAddWidget(option.type, symbol)}
                      className="text-white cursor-pointer hover:bg-card-tertiary focus:bg-card-tertiary"
                    >
                      {symbol}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </div>
      </div>
    </>
  );
};
