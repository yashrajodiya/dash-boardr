export enum WidgetType {
  PriceChart = 'priceChart',
  VolumeBar = 'volumeBar',
  CompanyInfo = 'companyInfo',
  NewsFeed = 'newsFeed',
  Watchlist = 'watchlist',
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GridItem {
  id: number;
  position: Position;
  size: Size;
  type: WidgetType;
  symbol: string;
}

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}
