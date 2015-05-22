'use strict';

var httpolyglot = require('httpolyglot'),
    httpProxy = require('http-proxy'),
    rewrite = require('../rewrite'),
    nodeStatic = require('node-static'),
    fs = require('fs'),
    path = require('path'),
    stats = require('../stats'),
    modes = require('../modes'),
    exec = require('child_process').exec,
    config = require('../config'),
    options = require('../options');

require('colors');
var proxy;
var line = '----------------------------------------------------------------';
module.exports = function() {
    setup(initServer);
};

function downloadServerConfig(cb) {
    exec('curl -s http://labs-git.usersys.redhat.com/snippets/4/raw', function(error, body) {
        if (error) {
            console.error('Errored downloading rc file');
            process.exit(1);
        }
        try {
            var servers = JSON.parse(body);
            config.set('servers', servers);
            cb(servers);
        } catch (e) {
            console.error('Errored saving server config');
            process.exit(1);
        }
    });
}

function getServers(cb) {
    function setServers(servers) {
        config.set('servers', servers);
        cb();
    }
    var servers = config.get('servers');
    if (servers) {
        return cb();
    }
    downloadServerConfig(setServers);
}

function setup(cb) {
    proxy = httpProxy.createProxyServer({});
    // Prevent proxy from bombing out
    proxy.on('error', function() {});
    var mode = options.get('mode');
    proxy.on('proxyReq', function(proxyReq) {
        proxyReq.setHeader('Accept-Encoding', '');
    });
    if (mode === 'portal' || mode === 'mixed') {
        proxy.on('proxyRes', function(proxyRes, req, res) {
            rewrite(proxyRes, req, res);
        });
    }
    getServers(cb);
}

function verboseBanner() {
    if (options.get('verbose')) {
        console.log(line);
        console.log('\t\t\tPROXY LOG'.bold);
        console.log(line);
    }
}

function noConfigBanner() {
    console.log(line);
    console.log('\t\t\tHeads up!'.red.bold);
    console.log('No hosts found...');
    console.log('I recommend running `accessproxy configure` before continuing.');
    console.log(line);
}

function initStatic(port) {
    var staticPath = options.get('static');
    var file = new nodeStatic.Server(staticPath, {
        cache: false
    });
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

    var server = httpolyglot.createServer({
        key: fs.readFileSync(currentDir + '/key.pem'),
        cert: fs.readFileSync(currentDir + '/cert.pem'),
    }, function(req, res) {
        if (!req.socket.encrypted) {
            res.writeHead(301, {
                'Location': 'https://' + req.headers.host
            });
            return res.end();
        }
        stats.increment();
        proxy.web.apply(proxy, modeFn(req, res));
    });

    var listenport = options.get('listen'),
        targetport = options.get('target');

    var servers = config.get('servers'),
        hosts = config.get('hosts');

    if (!hosts) {
        noConfigBanner();
        hosts = options.get('defaultHosts');
    }

    server.listen(listenport, function() {
        console.log('\nproxy listening on port ' + (listenport + '').bold.white);
        console.log('proxy redirecting to port ' + (targetport + '').bold.white);
        console.log('proxy is in ' + mode.bold.white + ' mode\n');

        function getUrl(host) {
            return ('https://' + host + ':' + listenport);
        }
        var arrow = '--->'.cyan;
        console.log('  FTE:\t', (getUrl(hosts.fte)).bold.white, '\t' + arrow + '\t', servers.fte.bold.white);
        console.log('  CI:\t', (getUrl(hosts.ci)).bold.white, '\t' + arrow + '\t', servers.ci.bold.white);
        console.log('  QA:\t', (getUrl(hosts.qa)).bold.white, '\t' + arrow + '\t', servers.qa.bold.white);
        console.log('  Stage:', (getUrl(hosts.stage)).bold.white, '\t' + arrow + '\t', servers.stage.bold.white);
        console.log('  Prod:\t', (getUrl(hosts.prod)).bold.white, '\t' + arrow + '\t', servers.prod.bold.white, '\n');
        if (mode === 'portal') {
            return initStatic(targetport);
        }
        if (mode === 'mixed') {
            return initStatic(parseInt(targetport, 10) + 1);
        }
        verboseBanner();
    });
}
