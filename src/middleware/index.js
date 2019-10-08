/**
 * 自定义中间件
 */
const crosMiddle = require('./cros.mid');
const reqInterceptMiddle = require('./reqIntercept.mid');

module.exports = {
  crosMiddle,
  reqInterceptMiddle
};
