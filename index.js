const { Readable } = require('stream');
const httpProxy = require('http-proxy');
const CryptoJS = require('crypto-js');

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
    const date = new Date().toUTCString();
    const requestLine = `${req.method} ${req.rawPath} HTTP/1.1`;
    const contentMD5 = CryptoJS.MD5(req.rawBody.toString()).toString(CryptoJS.enc.Base64);

    const signingString = `date: ${date}\n${requestLine}\ncontent-md5: ${contentMD5}`;
    const signature = CryptoJS.HmacSHA256(signingString, process.env.KEY_SECRET).toString(CryptoJS.enc.Base64);
    const authorization = `Signature keyId="${process.env.KEY_ID}",algorithm="hmac-sha256",headers="date request-line content-md5",signature="${signature}"`;

    proxyReq.setHeader('Date', date);
    proxyReq.setHeader('Content-MD5', contentMD5);
    proxyReq.setHeader('Authorization', authorization);
});

const server = require('http').createServer((req, res) => {
    req.rawBody = Buffer.alloc(0);
    const reqUrl = new URL(req.url);
    req.rawTarget = `${reqUrl.protocol || 'http:'}//${reqUrl.host}`;
    req.rawPath = reqUrl.pathname + (reqUrl.search || '');

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