/**
 * 请求拦截器
 */
'use strict';
const fs = require('fs');
const path = require('path');
const util = require('util');
const readFilePromise = util.promisify(fs.readFile);

module.exports = async (ctx, next) => {
  const apiDir = '_api'; // api私有目录
  const reqUrl =  ctx.req.url;
  const apiIndex = reqUrl.indexOf(apiDir); // 必须是在当前目录下_api文件夹拦截
  const isJson = reqUrl.indexOf('.json') !== -1; // 是否访问.json文件
  if(apiIndex && apiIndex ===1 && !isJson){
    try {
      const lastIndex1 = reqUrl.lastIndexOf(`\/${apiDir}\/`);
      const lastIndex2 = reqUrl.lastIndexOf('\?');
      const serviceName = reqUrl.substring(lastIndex1 + 1, lastIndex2 === -1 ? reqUrl.length : lastIndex2);
      // 重写请求: 1 读取文件,反序列化响应结果 +  todo 配置api校验规则
      const currentDir = global.$app.staticDir;// 当前运行目录
      const targetFile = path.join(currentDir,`/${serviceName}.json`);
      const isTargetFile = fs.existsSync(targetFile);
      if(isTargetFile){
        const readResult = await readFilePromise(targetFile,'utf8');
        ctx.body = JSON.parse(readResult);
      }else {
        ctx.body = {
          data:"",
          message:`${targetFile}文件不存在!`,
          code:9999
        }
      }
    }catch (e) {
      ctx.body = {
        data:e,
        message:"tm-mock 请求出错了",
        code:9999
      }
    }
  }else {
    await next();
  }
};
