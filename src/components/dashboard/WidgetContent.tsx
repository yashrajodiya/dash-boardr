import { BarChart3, TrendingUp, Building2, Newspaper, List } from 'lucide-react';
import { GridItem, WidgetType } from '@/types/dashboard';

interface WidgetContentProps {
  item: GridItem;
}

export const WidgetContent = ({ item }: WidgetContentProps) => {
  const getWidgetConfig = () => {
    switch (item.type) {
      case WidgetType.PriceChart:
        return {
          icon: TrendingUp,
          color: 'bg-card',
          title: `${item.symbol} Price Chart`,
        };
      case WidgetType.VolumeBar:
        return {
          icon: BarChart3,
          color: 'bg-background',
          title: `${item.symbol} Volume`,
        };
      case WidgetType.CompanyInfo:
        return {
          icon: Building2,
          color: 'bg-card-secondary',
          title: `${item.symbol} Company Info`,
        };
      case WidgetType.NewsFeed:
        return {
          icon: Newspaper,
          color: 'bg-card',
          title: `${item.symbol} News`,
        };
      case WidgetType.Watchlist:
        return {
          icon: List,
          color: 'bg-background',
          title: 'Watchlist',
        };
      default:
        return {
          icon: TrendingUp,
          color: 'bg-card',
          title: 'Widget',
        };
    }
  };

  const config = getWidgetConfig();
  const Icon = config.icon;

  return (
    <div
      className={`w-full h-full ${config.color} flex flex-col items-center justify-center pt-8`}
    >
      <Icon className="w-12 h-12 text-white/30 mb-4" />
      <p className="text-white/50 text-base font-medium mb-2">{config.title}</p>
      <p className="text-white/30 text-xs">
        {Math.floor(item.size.width)}x{Math.floor(item.size.height)}
      </p>
    </div>
  );
};

export const getWidgetIcon = (type: WidgetType) => {
  switch (type) {
    case WidgetType.PriceChart:
      return TrendingUp;
    case WidgetType.VolumeBar:
      return BarChart3;
    case WidgetType.CompanyInfo:
      return Building2;
    case WidgetType.NewsFeed:
      return Newspaper;
    case WidgetType.Watchlist:
      return List;
    default:
      return TrendingUp;
  }
};

export const getWidgetTitle = (item: GridItem) => {
  switch (item.type) {
    case WidgetType.PriceChart:
      return `${item.symbol} Price Chart`;
    case WidgetType.VolumeBar:
      return `${item.symbol} Volume`;
    case WidgetType.CompanyInfo:
      return `${item.symbol} Company Info`;
    case WidgetType.NewsFeed:
      return `${item.symbol} News`;
    case WidgetType.Watchlist:
      return 'Watchlist';
    default:
      return 'Widget';
  }
};
