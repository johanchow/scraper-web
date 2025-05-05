// 文章来源站点
export enum ArticleSource {
  Coinbase = 'coinbase',
}

// 加载更多数据方式
export enum LoadMoreEnum {
  Button = 'button',
  InfiniteScroll = 'infiniteScroll',
}

export interface LoadMoreConfig {
  type: LoadMoreEnum;
  buttonSelector?: string;
  infiniteScrollSelector?: string;
  maxPages?: number;
}

export interface PageConfig {
  url: string;
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
}

export interface ScraperResult {
  id: string;
  title: string;
  link: string;
  date?: string;
  author?: string;
  summary?: string;
  source: ArticleSource;
}

