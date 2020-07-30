#! /usr/bin/env node

// 需要通过http启动一个模块 内部是基于 koa 的

// 创建一个koa服务

const createServer = require('../index');

createServer().listen(4000, () => {
    console.log('server start 4000 port', 'http://localhost:4000');
});