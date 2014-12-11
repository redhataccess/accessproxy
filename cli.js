#!/usr/bin/env node

'use strict';

var fs = require('fs'),
    path = require('path'),
    os = require('os'),
    https = require('https'),
    httpProxy = require('http-proxy'),
    program = require('commander'),
    prompt = require('prompt'),
    nodeStatic = require('node-static'),
    modes = require('./lib/modes'),
    hijack = require('./lib/hijack'),
    options = require('./lib/options'),
    version = require('./package.json').version;

program
    .version(version)
    .option('-l, --listen <n>', 'The port to listen on', parseInt, 1337)
    .option('-t, --target <n>', 'The port to loopback to', parseInt, 9000)
    .option('-T, --hostname <hostname>', 'The hostname to loopback to')
    .option('-p, --proxy <hostname>', 'The hostname to proxy to')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-m, --mode <mode>', 'Proxy mode (labs, portal, or mixed)', 'labs')
    .option('-s, --static <path>', 'Path to serve up static assets', './')
    .option('-R, --remove', 'Remove the stored labs ci server')
    .parse(process.argv);

options.mixin(program);
var listenport = program.listen,
    targetport = program.target,
    ciServer;

var proxy = httpProxy.createProxyServer({});


// Prevent proxy from bombing out
proxy.on('error', function() {});

if (program.mode === 'portal' || program.mode === 'mixed') {
    proxy.on('proxyRes', function(proxyRes, req, res) {
        hijack(proxyRes, req, res);
    });
}

var currentDir = path.join(path.dirname(fs.realpathSync(__filename)), '.');

function initStatic(port) {
    var staticPath = program['static'];
    var file = new nodeStatic.Server(staticPath);
    require('http').createServer(function(req, res) {
        req.addListener('end', function() {
            file.serve(req, res);
        }).resume();
    }).listen(port);
}

function initServer() {
    var modeFn = (modes[program.mode]) ? modes[program.mode] : modes.labs;

    var server = https.createServer({
        key: fs.readFileSync(currentDir + '/key.pem'),
        cert: fs.readFileSync(currentDir + '/cert.pem'),
    }, function(req, res) {
        proxy.web.apply(proxy, modeFn(req, res));
    });

    console.log('\nproxy listening on port ' + (listenport + '').bold.white);
    console.log('proxy redirecting to port ' + (targetport + '').bold.white);
    console.log('using ' + ciServer.bold.white + ' as the ci server\n');
    options.set('ciServer', ciServer);
    server.listen(listenport);
    if (program.mode === 'portal') {
        initStatic(targetport);
    }
    if (program.mode === 'mixed') {
        initStatic(targetport + 1);
    }
    if (program.verbose) {
        var line = '------------------------------------------------------------';
        console.log(line);
        console.log('\t\t\tPROXY LOG'.bold);
        console.log(line);
    }
}

var labsCiLocation = process.env.HOME + '/.accesslabsci';
if (program.remove) {
    try {
        fs.unlinkSync(labsCiLocation);
        console.log('Removed labsci file');
    } catch (e) {
        console.log('Errored removing labsci file. Did it exist?');
    } finally {
        process.exit(0);
    }
}

if (program.proxy) {
    ciServer = program.proxy;
    return initServer();
}
if (!program.proxy && os.type().indexOf('Windows') === 0) {
    console.log('\nWINDOWS FAILBOAT. -> Pass in a proxy hostname with `-p`'.red.bold);
    return process.exit(1);
}

try {
    ciServer = fs.readFileSync(labsCiLocation) + '';
    initServer();
} catch (e) {
    console.log('\nYo! Couldn\'t find a ci server to point to...'.red.bold);
    prompt.message = '';
    prompt.delimiter = '---'.green;
    prompt.start();

    prompt.get({
        properties: {
            labsci: {
                description: '  Where should I point?  '.white
            }
        }
    }, function(err, result) {
        if (result && result.labsci) {
            console.log('Pointing at: '.cyan + result.labsci.cyan);
            fs.writeFileSync(labsCiLocation, result.labsci);
            ciServer = result.labsci;
            initServer();
        }
    });
}
