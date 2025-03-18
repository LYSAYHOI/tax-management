const express = require("express");
var cors = require('cors')
const app = express();
app.use(cors());
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/query/**', createProxyMiddleware({
    target: 'https://hoadondientu.gdt.gov.vn:30000',
    changeOrigin: true,
    // secure: false,
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}));
app.listen(8080, "0.0.0.0");