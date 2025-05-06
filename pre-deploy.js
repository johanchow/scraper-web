// import { CoinbaseScraper } from './dist/scraper/CoinbaseScraper.js';
const CoinbaseScraper = require('./dist/scraper/CoinbaseScraper.js');

function validateResults(results) {
  if (!Array.isArray(results)) {
    throw new Error('结果必须是数组');
  }

  if (results.length === 0) {
    throw new Error('结果数组不能为空');
  }

  for (const article of results) {
    // 检查必要字段是否存在
    if (!article.id) throw new Error('文章缺少 id 字段');
    if (!article.title) throw new Error('文章缺少 title 字段');
    if (!article.link) throw new Error('文章缺少 link 字段');
    if (!article.source) throw new Error('文章缺少 source 字段');

    // 检查字段值是否为空
    if (article.id.trim() === '') throw new Error('文章 id 不能为空');
    if (article.title.trim() === '') throw new Error('文章 title 不能为空');
    if (article.link.trim() === '') throw new Error('文章 link 不能为空');

    // 检查 URL 格式
    try {
      new URL(article.link);
    } catch (e) {
      throw new Error(`文章 link 不是有效的 URL: ${article.link}`);
    }

    // 检查日期格式（如果存在）
    if (article.date) {
      const date = new Date(article.date);
      if (isNaN(date.getTime())) {
        throw new Error(`文章日期格式无效: ${article.date}`);
      }
    }
  }

  console.log('验证通过：所有文章数据格式正确');
  return true;
}

(async () => {
  try {
    console.log('开始抓取 Coinbase 博客...');
    const scraper = new CoinbaseScraper.default({
      url: 'https://www.coinbase.com/en-sg/blog/landing/product',
      proxyList: [],
    });

    await scraper.start();
    const results = scraper.getResult();

    console.log(`抓取完成，共获取 ${results.length} 篇文章`);
    validateResults(results);

    process.exit(0); // 成功退出
  } catch (error) {
    console.error('验证失败:', error.message);
    process.exit(1); // 失败退出
  }
})();
