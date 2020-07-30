const fs = require('fs');
const path = require('path');
const moduleReg = /^\/@modules\//;

function resolveVue (root) {
    // vue 由几部分组成  runtime-dom runtime-core reactivity shared, 在后端解析.vue文件 compiler-sfc 

    // 编译是在后端实现的， 拿到的文件是commonjs规范的
    const compilerPkgPath = path.join(root, 'node_modules', '@vue/compiler-sfc/package.json');
    const compilerPkg = require(compilerPkgPath);
    const compilerPath = path.join(path.dirname(compilerPkgPath), compilerPkg.main);

    const resovlePath = name => path.resolve(root, 'node_modules', `@vue/${name}/dist/${name}.esm-bundler.js`);
    const runtimeDomPath = resovlePath('runtime-dom');
    const runtimeCorePath = resovlePath('runtime-core');
    const reactivityPath = resovlePath('reactivity');
    const sharedPath = resovlePath('shared');

    // esModule 模块
    return {
        compiler: compilerPath,
        '@vue/runtime-dom': runtimeDomPath,
        '@vue/runtime-core': runtimeCorePath,
        '@vue/reactivity': reactivityPath,
        '@vue/shared': sharedPath,
        vue: runtimeDomPath,
    }
}

function moduleResolvePlugin ({ app, root }) {
    const vueResolved = resolveVue(root); // 根据当前运行 vite 的目录解析出一个文件表来， 包含vue中的所有模块

    app.use(async (ctx, next) => {
        if (!moduleReg.test(ctx.path)) { // 处理当前请求的路径 是否是以 @modules开头的
            return next();
        }

        // 将 @modules 替换掉
        const id = ctx.path.replace(moduleReg, '')
        console.log('id', id)
        ctx.type = 'js'; // 设置响应结果是 js 类型
        // 去当前项目下查找 vue 对应的真实的文件
        const content = fs.readFileSync(vueResolved[id], 'utf-8');
        ctx.body = content;
    })
}

exports.moduleResolvePlugin = moduleResolvePlugin;
exports.resolveVue = resolveVue;