#!/usr/bin/env node
/**
 * tm-mock 入口
 */
'use strict';
const { URL } = require('url');
const http = require('http');
const https = require('https');
const debug = require('debug')('tm-mock:server');
const Koa = require('koa');
const koaJson = require('koa-json');
const koaBody = require('koa-body');
const koaStatic = require('koa-static');
const logger = require('koa-logger');
const serveIndex = require('koa2-serve-index');// 静态目录浏览
// 服务器api代理
const proxy = require('http-proxy-middleware');
const k2c = require('koa2-connect');
// 自定义方法
const { appTimestamp } = require('./utils/index');
const { crosMiddle,reqInterceptMiddle } = require('./middleware/index');
const { openBrowserURL, getIPAddress } = require('./utils/index');

/***命令行参数解析***/
const argv = require("minimist")(process.argv.slice(2), {
  'alias': {
    'silent': 's',
    'port': 'p',
    'hostname': 'h',
    'dir': 'd',
    'proxy': 'x',
    'log': 'l',
  },
  'string': ['port', 'hostname', 'fallback'],
  'boolean': ['silent', 'log'],
  'default': {
    'port': 8000,
    'dir': process.cwd()
  }
});

if (argv.help) {
  console.log("Usage:");
  console.log("  tm-mock --help // print help information");
  console.log("  tm-mock // 8000 as default port, current folder as root");
  console.log("  tm-mock 8888 // 8888 as port");
  console.log("  tm-mock -p 8989 // 8989 as port");
  console.log("  tm-mock -s // don't open browser");
  console.log("  tm-mock -h localhost // localhost as hostname");
  console.log("  tm-mock -d /home // /home as root");
  console.log("  tm-mock -l // print log");
  console.log("  tm-mock --proxy http://localhost:7000/api // Support shorthand URL webpack.config.js or customize config file");
  process.exit(0);
}

const hostname = argv.hostname || getIPAddress();
const port = parseInt(argv._[0] || argv.port, 10);
const staticDir = argv.dir;
// 全局变量
global.$app = {
  staticDir: staticDir,
};
/***koa2 app***/
const app = new Koa();
// 中间件
app.use(koaJson());
app.use(koaBody());
// 自定义中间件
app.use(crosMiddle);
app.use(reqInterceptMiddle);
// 是否显示日志
if(argv.log){
  app.use(logger());
}
// 重写console
appTimestamp();
// 作为代理服务器转发api
if (argv.proxy) {
  try {
    const url = new URL(argv.proxy);
    app.use(
      k2c(
        proxy({
          target: url.toString(),
          changeOrigin: true
        })
      )
    );
  } catch (e) {
    // if config file
    let configProxy = require(path.resolve(argv.dir, argv.proxy));
    // support webpack-dev-server proxy options
    try {
      configProxy = configProxy.devServer.proxy;
    } catch (e) {
      if (argv.log) {
        debug(e);
        console.log(e);
      }
    }
    const contexts = Object.keys(configProxy);
    contexts.forEach(context => {
      let options = configProxy[context];
      app.use(k2c(proxy(context, options)));
    });
  }
}
// 静态访问目录页面索引
if(staticDir){
  app.use(koaStatic(
    staticDir
  ));
  app.use(serveIndex(staticDir, { 'icons': true }));
}else {
  console.warn('static dir is not here!');
}
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error:', err, ctx)
});
/*** 启动本地koa2 服务器 ***/
const server = http.createServer(app.callback());
/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}
/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  // 忽略80端口
  const _port = (port != 80 ? ':' + port : '');
  const url = "http://" + hostname + _port + '/';
  debug(`${staticDir} server running at ${url}`);
  console.log(`${staticDir} server running at`,url);

  if(!argv.silent){
    openBrowserURL(url)
  }

}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
