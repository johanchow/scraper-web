import puppeteer, { Browser, LaunchOptions, Page } from 'puppeteer';
import { retryOperation } from '../util';
import { LoadMoreConfig, LoadMoreEnum, PageConfig, ScraperResult } from "../typing";

class BaseScraper {
  private config: PageConfig;
  private results: ScraperResult[];
  private browser: Browser | null = null;

  constructor(config: PageConfig) {
    this.config = config;
    this.results = [];
  }

  private async humanLikeDelay(): Promise<void> {
    const delay = 1 * 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  protected async waitForElement(page: Page, selector: string, timeout: number = 30000): Promise<void> {
    try {
      await page.waitForSelector(selector, { timeout });
    } catch (error) {
      console.warn(`等待元素 ${selector} 超时`);
    }
  }

  private async humanLikeScroll(page: Page): Promise<void> {
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
  }

  protected async setupBrowser(): Promise<Browser> {
    const launchOptions: LaunchOptions = {
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920x1080',
      ],
    };

    if (this.config.proxyUrl) {
      launchOptions.args?.push(`--proxy-server=${this.config.proxyUrl}`);
    }

    return await puppeteer.launch(launchOptions);
  }

  protected async setupPage(browser: Browser): Promise<Page> {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1920,
      height: 1080,
    });

    await page.setJavaScriptEnabled(true);

    return page;
  }

  protected async handlePagination(
    page: Page,
    nextPageSelector: string,
    maxPages: number = 5
  ): Promise<void> {
    let currentPage = 1;

    while (currentPage < maxPages) {
      try {
        const hasNextPage = await page.$(nextPageSelector);
        if (!hasNextPage) break;

        await page.click(nextPageSelector);
        await this.humanLikeDelay();
        // await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await this.humanLikeScroll(page);

        const html = await page.content();
        await this.parseContent(html);

        currentPage++;
      } catch (error) {
        console.error(`处理分页时出错: ${error}`);
        break;
      }
    }
  }

  protected async handleInfiniteScroll(
    page: Page,
    loadMoreSelector: string,
    maxScrolls: number = 5
  ): Promise<void> {
    let scrollCount = 0;

    while (scrollCount < maxScrolls) {
      try {
        const loadMoreButton = await page.$(loadMoreSelector);
        if (!loadMoreButton) {
          console.error(`没有找到滚动拉取更多的按钮: ${loadMoreSelector}`);
          break;
        }

        console.log(`第${scrollCount+1}次点击加载更多`)
        await loadMoreButton.click();
        await this.humanLikeDelay();
        // 等待某个接口完成
        // await page.waitForResponse(response => response.url().includes('api') || response.url().includes('load'));
        await this.humanLikeScroll(page);

        const html = await page.content();
        await this.parseContent(html);

        scrollCount++;
      } catch (error) {
        console.error(`处理无限滚动时出错: ${error}`);
        break;
      }
    }
  }

  public async start() {
    console.info('Scraper start');
    try {
      this.browser = await this.setupBrowser();
      const page = await this.setupPage(this.browser);

      // 如果失败自动重试3次，尽量保证正常打开页面
      await retryOperation(async () => {
        await page.goto(this.config.url, {
          waitUntil: 'networkidle0',
          timeout: 30000,
        });
      }, 3);
      console.info(`Scraper打开链接: ${this.config.url}`);

      await this.humanLikeScroll(page);
      await this.humanLikeDelay();

      let html: string;
      const loadMoreConfig = this.getLoadMoreConfig();
      if (LoadMoreEnum.Pagination === loadMoreConfig.type) {
        // 处理翻页
        console.info(`Scraper开始翻页`);
        await this.handlePagination(
          page,
          loadMoreConfig.paginationSelector!,
          10, // 先默认加载10页
        )
      } else if (LoadMoreEnum.InfiniteScroll === loadMoreConfig.type) {
        // 处理无限滚动
        console.info(`Scraper开始滚动拉取`);
        await this.handleInfiniteScroll(
          page,
          loadMoreConfig.infiniteScrollSelector!,
          5 // 最多加载5页
        );
      }
      console.info(`Scraper开始解析内容`);
      html = await page.content();
      await this.parseContent(html);
    } catch (error) {
      console.error('抓取过程中出错:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
    console.info('Scraper Finish');
  }

  public getResult(): ScraperResult[] {
    return this.results;
  }

  protected addResults(results: ScraperResult[]): void {
    this.results = [...this.results, ...results];
  }

  protected async parseContent(html: string): Promise<ScraperResult[]> {
    throw new Error('请在派生类中实现parseContent!');
  }

  protected getLoadMoreConfig(): LoadMoreConfig {
    throw new Error('请在派生类中实现getLoadMoreConfig!');
  }
}

export default BaseScraper;

