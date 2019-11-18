const { Readable } = require('stream');
const httpProxy = require('http-proxy');

function createReadableStream(buffer) {
    const stream = new Readable();
    stream._buffer = buffer;
    stream._read = () => {
        stream.push(stream._buffer);
        stream._buffer = null;
    };
    return stream;
}

const proxy = httpProxy.createProxyServer({ws: false});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('X-Signed-By', 'playground-signing-proxy');
});

const server = require('http').createServer((req, res) => {
    req.rawBody = Buffer.alloc(0);
    const reqUrl = new URL(req.url);
    req.rawTarget = `${reqUrl.protocol || 'http:'}//${reqUrl.host}`;

    req.on('data', (data) => {
        req.rawBody = Buffer.concat([req.rawBody, data]);
    });
    req.on('end', () => {
        proxy.web(req, res, {
            buffer: createReadableStream(req.rawBody),
            target: req.rawTarget
        });
    });

    req.resume();
});

server.listen(5050);