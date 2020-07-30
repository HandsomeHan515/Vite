const { readBody } = require('../utils');
const { parse } = require('es-module-lexer');// 解析 import 语法
const MagicString = require('magic-string'); // 因为字符串具有不变性

function rewriteImports (source) {
    let imports = parse(source)[0];
    let magicstring = new MagicString(source);

    if (imports.length) {
        // 说明有多条
        for (let i = 0; i < imports.length; i++) {
            let { s, e } = imports[i];
            let id = source.substring(s, e);
            // 当前开头是 \ 或者 . 不需要重写
            if (/^[^\/\.]/.test(id)) {
                id = `/@modules/${id}`; // 标识这个模块是第三方模块
                magicstring.overwrite(s, e, id);
            }
        }
    }
    return magicstring.toString(); // 增加 /@modules 浏览器会再次发送请求，服务器拦截带有 /@modules 前缀的请求，进行处理
}

function moduleRewritePlugin ({ app, root }) {
    app.use(async (ctx, next) => {
        await next();
        // 在这里完善了自己的逻辑 洋葱模型

        // 读取流中的数据
        if (ctx.body && ctx.response.is('js')) {
            let content = await readBody(ctx.body);
            // 重写内容 将重写后的结果返回回去
            const result = rewriteImports(content);
            ctx.body = result;
        }
    });
}

exports.moduleRewritePlugin = moduleRewritePlugin;