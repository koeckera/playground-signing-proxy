const httpProxy = require('http-proxy');

const proxy = httpProxy.createProxyServer({ws: false});

proxy.on('proxyReq', function (proxyReq, req, res, options) {
    proxyReq.setHeader('X-Signed-By', 'playground-signing-proxy');
});

const server = require('http').createServer((req, res) => {
    const reqUrl = new URL(req.url);
    req.rawTarget = `${reqUrl.protocol || 'http:'}//${reqUrl.host}`;

    proxy.web(req, res, {target: req.rawTarget});
});

server.listen(5050);