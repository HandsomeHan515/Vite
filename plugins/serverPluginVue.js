const fs = require('fs');
const path = require('path');
const { resolveVue } = require('./serverPluginModuleResolve');
const defaultExportReg = /((?:^|\n|;)\s*)export default/;

function vuePlugin ({ app, root }) {
    app.use(async (ctx, next) => {
        if (!ctx.path.endsWith('.vue')) {
            return next();
        }
        // vue 文件处理
        const filePath = path.join(root, ctx.path);
        const content = fs.readFileSync(filePath, 'utf-8');
        // 获取文件内容
        let { parse, compileTemplate } = require(resolveVue(root).compiler);
        let { descriptor } = parse(content);
        if (!ctx.query.type) {
            let code = ``;
            if (descriptor.script) {
                let content = descriptor.script.content;
                let replaced = content.replace(defaultExportReg, `$1const __script =`);
                code += replaced;
            }
            if (descriptor.template) { // App.vue?type=template
                const templateRequest = ctx.path + `?type=template`;
                code += `\nimport { render as __render } from ${JSON.stringify(templateRequest)}`;
                code += `\n__script.render = __render`;
            }
            ctx.type = 'js';
            code += `\nexport default __script`;
            ctx.body = code;
        }

        if (ctx.query.type === 'template') {
            ctx.type = 'js';
            let content = descriptor.template.content;
            const { code } = compileTemplate({ source: content });
            ctx.body = code;
        }
    })
}

exports.vuePlugin = vuePlugin;