// 文章来源站点
export enum ArticleSource {
  Coinbase = 'coinbase'
}

// 加载更多数据方式
export type LoadMoreConfig = {
  type: LoadMoreEnum;
  paginationSelector?: string;
  infiniteScrollSelector?: string;
};
export enum LoadMoreEnum {
  /* 没有更多 */
  None = 'none',
  /* 翻页 */
  Pagination = 'pagination',
  /* 无限滚动 */
  InfiniteScroll = 'infinite-scroll',
}

export type PageConfig = {
  url: string;
  proxyList: {
    host: string;
    port: number;
  }[];
}

export type ScraperResult = {
  id: string;
  title: string;
  link: string;
  date: string;
  summary: string;
  source: ArticleSource.Coinbase
}

