const { Readable } = require('stream');

async function readBody (stream) {
    if (stream instanceof Readable) {
        // koa 中要求 所有异步方法必须包装成promise
        return new Promise((resolve, reject) => {
            let res = '';
            stream
                .on('data', data => {
                    res += data;
                })
                .on('end', () => {
                    resolve(res);
                });
        })
    } else {
        return stream.toString();
    }
}

exports.readBody = readBody;