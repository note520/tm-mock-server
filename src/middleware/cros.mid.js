/**
 * CROS 跨域请求处理 开启配置
 */
module.exports = async (ctx, next) => {
  // 开启 CROS
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  ctx.set('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With');
  if (ctx.method === 'OPTIONS') {
    ctx.body = 200;
  }
  await next();
};
