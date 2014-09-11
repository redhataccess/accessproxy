#!/usr/bin/env node

'use strict';

var fs = require('fs'),
    path = require('path'),
    https = require('https'),
    httpProxy = require('http-proxy'),
    program = require('commander');

program
    .version('0.0.1')
    .option('-l, --listen <n>', 'Listen', parseInt)
    .option('-t, --target <n>', 'Target', parseInt)
    .parse(process.argv);


var listenport = program.listen || 1337,
    targetport = program.target || 9000;

//
// Create a proxy server with custom application logic
//
var proxy = httpProxy.createProxyServer({});

// To modify the proxy connection before data is sent, you can listen
// for the 'proxyReq' event. When the event is fired, you will receive
// the following arguments:
// (http.ClientRequest proxyReq, http.IncomingMessage req,
//  http.ServerResponse res, Object options). This mechanism is useful when
// you need to modify the proxy request before the proxy connection
// is made to the target.
//

var labsCiRegex = /(^llabsci\.redhat\.com)/,
    rewriteRegex = /^\/(chrome_themes|webassets|services).*/;

proxy.on('proxyReq', function(proxyReq, req, res, options) {
  res.setHeader('Access-Control-Allow-Origin', '*');
});

proxy.on('error', function(e) {});
var currentDir = path.join(path.dirname(fs.realpathSync(__filename)), '.');

var server = https.createServer({
    key: fs.readFileSync(currentDir + '/key.pem'),
    cert: fs.readFileSync(currentDir + '/cert.pem'),
}, function(req, res) {
    // You can define here your custom logic to handle the request
    // and then proxy the request.
    var host = req.headers.host,
        url = req.url;
    var loopback = 'http://localhost:' + targetport;
    var options = {
        target: loopback + url
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
    }
    proxy.web(req, res, options);
});

console.log('listening on port ' + listenport);
server.listen(listenport);
