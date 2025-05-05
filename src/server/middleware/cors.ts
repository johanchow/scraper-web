import cors from '@koa/cors';

export default cors({
  origin: (ctx: any) => {
    const origin = ctx?.header?.origin;
    if(!origin) {
      return false;
    }
    const allowedDomains: string[] = [];
    const allowedPattern = new RegExp(
        `^(.*\\.)?(${allowedDomains.map(domain => domain.replace(/\./g, '\\.')).join('|')})$`
    );
    if (allowedPattern.test(origin)) {
      return origin;
    }
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    return false;
  },
  maxAge: 86400, // 跨域预检请求获得信息的有效期24小时
  credentials: true,
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: [
    'DNT',
    'X-Mx-ReqToken',
    'Keep-Alive',
    'User-Agent',
    'X-Requested-With',
    'If-Modified-Since',
    'Cache-Control',
    'Content-Type',
    'Authorization',
    'tenant-id',
    'app-tenant-id',
    'app-access-token',
    'app-user-id',
  ],
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
});