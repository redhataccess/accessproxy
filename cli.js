#!/usr/bin/env node

'use strict';

var fs = require('fs'),
    path = require('path'),
    https = require('https'),
    httpProxy = require('http-proxy'),
    program = require('commander');

program
    .version('0.0.5')
    .option('-l, --listen <n>', 'Listen', parseInt)
    .option('-t, --target <n>', 'Target', parseInt)
    // Idea for future customizations
    //.option('-h, --host', 'Host')
    .parse(process.argv);


var listenport = program.listen || 1337,
    targetport = program.target || 9000;

var proxy = httpProxy.createProxyServer({});

var labsCiRegex = /(^foo\.redhat\.com)/,
    rewriteRegex = /^\/(chrome_themes|webassets|services).*/;

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  res.setHeader('Access-Control-Allow-Origin', '*');
});

// Catch errors...
proxy.on('error', function(e) {});

var currentDir = path.join(path.dirname(fs.realpathSync(__filename)), '.');

var server = https.createServer({
    key: fs.readFileSync(currentDir + '/key.pem'),
    cert: fs.readFileSync(currentDir + '/cert.pem'),
}, function(req, res) {
    var host = req.headers.host,
        url = req.url;
    var loopback = 'http://localhost:' + targetport;
    var options = {
        target: loopback + url,
        secure: false
    };
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Does not work ATM. Need a trusted ssl I believe
    // if (labsRegex.test(host) && rewriteRegex.test(url)) {
    //     options.target = 'https://access.redhat.com' + url;
    //     options.secure = false;
    // }
    if (labsCiRegex.test(host) && rewriteRegex.test(url)) {
        options.target = 'https://access.devgssci.devlab.phx1.redhat.com' + url;
        options.secure = false;
        options.prependPath = false;
    }
    proxy.web(req, res, options);
});

console.log('listening on port ' + listenport);
server.listen(listenport);
