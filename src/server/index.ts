import Koa from 'koa';
import { koaBody } from 'koa-body';
import serveStatic from 'koa-static';
import { router } from './api';
import { corsMiddleware } from './middleware';
const path = require('path');

const { IP = '127.0.0.1', PORT = 9080 } = process.env;
const app = new Koa();
app.use(corsMiddleware);
app.use(koaBody({
  jsonLimit: '10mb',
  formLimit: '10mb',
}));
app.use(router.routes());
app.use(router.allowedMethods());
const baseDir = process.cwd();
app.use(serveStatic(path.join(baseDir, 'public')));
app.on('error', (err, ctx) => {
  console.error('global error', err.stack);
});
app.listen(PORT, () => {
  console.log(`start server http://${IP}:${PORT} successfully`);
});
