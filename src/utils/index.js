const moment = require('moment');
const cp = require('child_process'); // 用来创建子进程
const os = require('os');
/**
 * 自动打开浏览器
 * @param url
 */
exports.openBrowserURL = function (url) {
  //  执行shell 命令
  const spawn = cp.spawn;
  const exec = cp.exec;
  switch (process.platform) {
    case "darwin":
      exec('open ' + url);
      break;
    case "win32":
      exec('start ' + url);
      break;
    default:
      spawn('xdg-open', [url]);
  }
};
/**
 * 获取系统ip4地址
 * @returns {string}
 */
exports.getIPAddress = function(){
  const ifaces = os.networkInterfaces();
  let ip = '';
  for (let dev in ifaces) {
    ifaces[dev].forEach(function (details) {
      if (ip === '' && details.family === 'IPv4' && !details.internal) {
        ip = details.address;
        return;
      }
    });
  }
  return ip || "127.0.0.1";
};

/**
 * 默认方法增加时间戳
 */
exports.appTimestamp = function () {
  ['log', 'error', 'warn'].forEach(method => {
    const _method = console[method];
    console[method] = (...args) => {
      _method(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]`,...args)
    }
  });
};
