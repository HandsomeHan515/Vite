const static = require('koa-static');
const path = require('path');

function serveStaticPlugin ({ app, root }) {
    // vite 在哪运行就以哪个目录启动静态服务
    app.use(static(root));
    // 以public作为静态服务
    app.use(static(path.join(root, 'public')));
}

exports.serveStaticPlugin = serveStaticPlugin;