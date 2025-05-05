import { jest } from '@jest/globals';
import CoinbaseScraper from '../../src/scraper/CoinbaseScraper';
import { ArticleSource, ScraperResult } from '../../src/typing';

describe('CoinbaseScraper', () => {
  let scraper: CoinbaseScraper;

  beforeEach(() => {
    scraper = new CoinbaseScraper({
      url: 'https://www.coinbase.com/en-sg/blog/landing/product',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('应该成功抓取并解析文章内容', async () => {
    await scraper.start();
    const results = scraper.getResult();

    // 验证结果数组不为空
    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // 验证每篇文章的数据完整性
    results.forEach((article: ScraperResult) => {
      // 验证必要字段
      expect(article.id).toBeDefined();
      expect(article.title).toBeDefined();
      expect(article.link).toBeDefined();
      expect(article.source).toBe(ArticleSource.Coinbase);

      // 验证字段值不为空
      expect(article.id).not.toBe('');
      expect(article.title).not.toBe('');
      expect(article.link).not.toBe('');
    });
  });
});

