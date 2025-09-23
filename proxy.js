const express = require("express");
const { HttpsProxyAgent } = require("https-proxy-agent");
const cors = require('cors')

const app = express();
app.use(cors());

// Proxy config
const proxyUrl = "http://qxgxhp:vsbdvuwa@160.191.50.127:3488";
const agent = new HttpsProxyAgent(proxyUrl);

const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/query/**', createProxyMiddleware({
    target: 'https://hoadondientu.gdt.gov.vn:30000',
    changeOrigin: true,
    // secure: false,
    agent: agent, // Use proxy server
    onProxyRes: function (proxyRes, req, res) {
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}));
app.listen(8080, "0.0.0.0");