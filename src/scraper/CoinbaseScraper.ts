import * as cheerio from 'cheerio';
import BaseScraper from "./BaseScraper";
import { ArticleSource, LoadMoreConfig, LoadMoreEnum, ScraperResult } from "../typing";
import { Page } from 'puppeteer';

class CoinbaseScraper extends BaseScraper {
  private static readonly ARTICLE_SELECTOR = '[data-qa="CardGrid"] > div > *';
  private static readonly LOAD_MORE_SELECTOR = 'button.cds-interactable-i9xooc6';
  private static readonly ARTICLE_TITLE_SELECTOR = '[data-qa*="CardHeader"] > h3';
  private static readonly ARTICLE_SUMMARY_SELECTOR = '[data-qa*="CardHeader"] > [variant="body"]';
  private static readonly ARTICLE_LINK_SELECTOR = 'a[data-qa*="CardHeader"]';
  private static readonly ARTICLE_DATE_SELECTOR = '[data-qa*="CardEyebrow"] > p';

  /*
  async start(): Promise<void> {
    try {
      const browser = await this.setupBrowser();
      const page = await this.setupPage(browser);

      // 等待文章列表加载
      await this.waitForElement(page, CoinbaseScraper.ARTICLE_SELECTOR);

      // 处理无限滚动
      await this.handleInfiniteScroll(
        page,
        CoinbaseScraper.LOAD_MORE_SELECTOR,
        10 // 最多加载10页
      );

      // 获取最终内容
      const html = await page.content();
      await this.parseContent(html);

    } catch (error) {
      console.error('Coinbase 博客抓取失败:', error);
    }
  }
  */

  async parseContent(html: string): Promise<ScraperResult[]> {
    const $ = cheerio.load(html);
    const results: ScraperResult[] = [];

    // 选择所有文章元素
    const $articles = $(CoinbaseScraper.ARTICLE_SELECTOR);
    console.log(`查到的文章的数量是 = ${$articles.length}`);
    $articles.each((_, element) => {
      const $article = $(element);

      // 提取文章标题
      const title = $article.find(CoinbaseScraper.ARTICLE_TITLE_SELECTOR).text().trim();

      // 提取文章链接
      const link = $article.find(CoinbaseScraper.ARTICLE_LINK_SELECTOR).attr('href');

      // 提取发布日期
      const date = $article.find(CoinbaseScraper.ARTICLE_DATE_SELECTOR).text().trim();

      // 提取文章摘要
      const summary = $article.find(CoinbaseScraper.ARTICLE_SUMMARY_SELECTOR).first().text().trim();

      if (title && link) {
        results.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title,
          link: link.startsWith('http') ? link : `https://www.coinbase.com${link}`,
          date,
          summary,
          source: ArticleSource.Coinbase
        });
      }
    });

    this.setResults(results);
    return results;
  }

  protected getLoadMoreConfig(): LoadMoreConfig {
    return {
      type: LoadMoreEnum.InfiniteScroll,
      infiniteScrollSelector: CoinbaseScraper.LOAD_MORE_SELECTOR,
    }
  }
}
export default CoinbaseScraper;

