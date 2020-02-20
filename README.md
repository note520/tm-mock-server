# tm-mock

#### 介绍
简单快速构建本地静态服务器 和 mock api 服务

#### 安装&使用
- 环境要求： node v7.6.0+

```
# 安装
npm i -g tm-mock-server

# 快速使用（进入目标目录,会自动打开浏览器，根据当前目录作为静态服务器访问资源目录）
tm-mock

# 查看命令帮助
tm-mock --help

# 不自动打开浏览器
tm-mock -s

# 指定目录
tm-mock -d ./xxx

# 指定端口
tm-mock -p 8989

# 显示静态服务器控制台日志
tm-mock -l

# 作为代理服务器转发api解决跨域问题
tm-mock -x http://target.com

```
#### api mock功能使用
- tm-mock启动目录下新建 _api文件（tm-mock私有标识目录）作为api mock数据管理文件
- 例如 '_api/test/db.json' db.json 则为 请求 '_api/test/db' 提供数据源。那么 get或者post ajax 访问 'http://x.x.x.x:8000/_api/test/db' 得到数据

#### 感谢
- 参考了[anywhere](https://github.com/JacksonTian/anywhere)的原理，基于koa2 实现了anywhere的功能并且增强
