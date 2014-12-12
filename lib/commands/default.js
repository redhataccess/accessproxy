'use strict';

var https = require('https'),
    httpProxy = require('http-proxy'),
    rewrite = require('../rewrite'),
    nodeStatic = require('node-static'),
    fs = require('fs'),
    path = require('path'),
    modes = require('../modes'),
    exec = require('child_process').exec,
    options = require('../options');

require('colors');

var home = (process.env.HOME || process.env.USERPROFILE),
    rhaccessrc = home + '/.rhaccessrc',
    proxy;

module.exports = function() {
    setup(initServer);
};

function downloadRcFile(cb) {
    exec('curl -so ' + rhaccessrc + ' http://labs-git.usersys.redhat.com/snippets/4/raw', function(error) {
        if (error) {
            console.error('Errored downloading rc file');
            process.exit(1);
        }
        exec('cat ' + rhaccessrc, function(err, stdout) {
            cb(JSON.parse(stdout));
        });
    });
}

function getServers(cb) {
    function setServers(servers) {
        options.set('servers', servers);
        cb();
    }
    if (fs.existsSync(rhaccessrc)) {
        setServers(JSON.parse(fs.readFileSync(rhaccessrc)));
    } else {
        downloadRcFile(setServers);
    }
}

function setup(cb) {
    proxy = httpProxy.createProxyServer({});
    // Prevent proxy from bombing out
    proxy.on('error', function() {});
    var mode = options.get('mode');
    if (mode === 'portal' || mode === 'mixed') {
        proxy.on('proxyRes', function(proxyRes, req, res) {
            rewrite(proxyRes, req, res);
        });
    }
    getServers(cb);
}

function verboseBanner() {
    if (options.get('verbose')) {
        var line = '------------------------------------------------------------';
        console.log(line);
        console.log('\t\t\tPROXY LOG'.bold);
        console.log(line);
    }
}

function initStatic(port) {
    var staticPath = options.get('static');
    var file = new nodeStatic.Server(staticPath);
    require('http').createServer(function(req, res) {
        req.addListener('end', function() {
            file.serve(req, res);
        }).resume();
    }).listen(port, function() {
        console.log('proxy is serving static assets on ' + (port + '').bold.white + ' from ' + staticPath.bold.white);
        verboseBanner();
    });
}

function initServer() {
    var currentDir = path.dirname(fs.realpathSync(require.main.filename));
    var mode = options.get('mode');
    var modeFn = (modes[mode]) ? modes[mode] : modes.labs;

    var server = https.createServer({
        key: fs.readFileSync(currentDir + '/key.pem'),
        cert: fs.readFileSync(currentDir + '/cert.pem'),
    }, function(req, res) {
        proxy.web.apply(proxy, modeFn(req, res));
    });

    var listenport = options.get('listen'),
        targetport = options.get('target'),
        ciServer = options.get('servers').ci;

    options.set('ciServer', ciServer);
    server.listen(listenport, function() {
        console.log('\nproxy listening on port ' + (listenport + '').bold.white);
        console.log('proxy redirecting to port ' + (targetport + '').bold.white);
        console.log('proxy is in ' + mode.bold.white + ' mode');
        console.log('using ' + ciServer.bold.white + ' as the ci server\n');
        if (mode === 'portal') {
            return initStatic(targetport);
        }
        if (mode === 'mixed') {
            return initStatic(targetport + 1);
        }
        verboseBanner();
    });
}
