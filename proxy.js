const express = require("express");
var cors = require('cors')
const app = express();
app.use(cors());
const { createProxyMiddleware } = require('http-proxy-middleware');
app.get('/api/**', function(req, res) {
    res.send("hello tuowng")
});
app.use('/query/**', createProxyMiddleware({ 
    target: 'https://hoadondientu.gdt.gov.vn:30000',
    changeOrigin: true, 
    onProxyRes: function (proxyRes, req, res) {
       proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    }
}));
app.listen(8080);