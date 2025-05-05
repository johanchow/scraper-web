import { Context } from 'koa';
import router from './router';
import CoinbaseScraper from '../scraper/CoinbaseScraper';

router.get('/coinbase/listResults', async (ctx: Context) => {
  // 暂定实时去执行爬虫获取数据
  const x = new CoinbaseScraper({
    url: 'https://www.coinbase.com/en-sg/blog/landing/product',
    proxyList: [],
  });
  await x.start();
  const results = x.getResult();
  ctx.body = {
    code: 0,
    message: '',
    data: results,
  };
});

export {
	router,
};
