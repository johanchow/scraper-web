import puppeteer from 'puppeteer';
import BaseScraper from './BaseScraper.js';
import { ArticleSource, ScraperResult } from '../typing.js';

export default class CoinbaseScraper extends BaseScraper {
  constructor(config: { url: string }) {
    super(config);
  }

  protected async parseContent(html: string): Promise<ScraperResult[]> {
    const results: ScraperResult[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const articles = doc.querySelectorAll('article');

    articles.forEach((article) => {
      const titleElement = article.querySelector('h2');
      const linkElement = article.querySelector('a');
      const dateElement = article.querySelector('time');
      const authorElement = article.querySelector('[data-testid="author-name"]');
      const summaryElement = article.querySelector('p');

      if (titleElement && linkElement) {
        const title = titleElement.textContent?.trim() || '';
        const link = linkElement.getAttribute('href') || '';
        const date = dateElement?.textContent?.trim() || '';
        const author = authorElement?.textContent?.trim() || '';
        const summary = summaryElement?.textContent?.trim() || '';

        results.push({
          id: this.generateId(title),
          title,
          link: this.normalizeUrl(link),
          date,
          author,
          summary,
          source: ArticleSource.Coinbase,
        });
      }
    });

    return results;
  }

  private generateId(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  private normalizeUrl(url: string): string {
    if (url.startsWith('/')) {
      return `https://www.coinbase.com${url}`;
    }
    return url;
  }
}

