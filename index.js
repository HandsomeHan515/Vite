const Koa = require('koa');
const { serveStaticPlugin } = require('./plugins/serverPluginServeStatic');
const { moduleRewritePlugin } = require('./plugins/serverPluginModuleRewrite');
const { moduleResolvePlugin } = require('./plugins/serverPluginModuleResolve');
const { htmlRewritePlugin } = require('./plugins/serverPluginHtml');
const { vuePlugin } = require('./plugins/serverPluginVue');

function createServer () {
    const app = new Koa(); // 创建一个koa实例
    const root = process.cwd(); // 当前的跟的位置
    // 运行 npm start 会创建服务
    // koa基于中间件来运行
    const context = {
        app,
        root
    }
    const resolvedPlugins = [// 插件集合
        htmlRewritePlugin,
        // 2. 解析 import 语法，进行重写路径操作 
        moduleRewritePlugin,
        // 3. 解析以 /@moudules 文件开头的内容 找到对应的结果
        moduleResolvePlugin,
        vuePlugin,
        // 1.实现静态服务的功能
        serveStaticPlugin // 读取文件将文件放到ctx.body中
    ];

    resolvedPlugins.forEach(plugin => plugin(context));
    return app; // 返回 app 中有listen方法
}

module.exports = createServer;