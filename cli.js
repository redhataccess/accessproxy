#!/usr/bin/env node

'use strict';

var fs = require('fs'),
    path = require('path'),
    os = require('os'),
    https = require('https'),
    httpProxy = require('http-proxy'),
    program = require('commander'),
    prompt = require('prompt'),
    version = require('./package.json').version;

program
    .version(version)
    .option('-l, --listen <n>', 'The port to listen on', parseInt)
    .option('-t, --target <n>', 'The port to loopback to', parseInt)
    .option('-T, --hostname <hostname>', 'The hostname to loopback to')
    .option('-p, --proxy <hostname>', 'The hostname to proxy to')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-r, --remove', 'Remove the stored labs ci server')
    .parse(process.argv);


var listenport = program.listen || 1337,
    targetport = program.target || 9000,
    ciServer;

var proxy = httpProxy.createProxyServer({});

// Cached regex(s)
var labsRegex = /(^prod\.foo\.redhat\.com)/,
    labsCiRegex = /(^foo\.redhat\.com)/,
    rewriteRegex = /^\/(chrome_themes|webassets|services|rs).*/;

// Prevent proxy from bombing out
proxy.on('error', function() {});

var currentDir = path.join(path.dirname(fs.realpathSync(__filename)), '.');

function verboseLog(type, url, source, target) {
    if (program.verbose) {
        console.log(type + ' ' + (source + url).red + ' ---> ' + (target + url).green);
    }
}

function initServer() {
    var server = https.createServer({
        key: fs.readFileSync(currentDir + '/key.pem'),
        cert: fs.readFileSync(currentDir + '/cert.pem'),
    }, function(req, res) {
        var host = req.headers.host,
            url = req.url;
        var targethostname = 'localhost';
        if (program.hostname) {
            targethostname = program.hostname;
        }
        var loopback = 'http://' + targethostname + ':' + targetport;
        var options = {
            target: loopback,
            secure: false,
            prependPath: false
        };

        if (rewriteRegex.test(url)) {
            var target;
            if (labsRegex.test(host)) {
                target = 'access.redhat.com';
            } else if (labsCiRegex.test(host)) {
                target = ciServer;
            }
            if (target) {
                // Does not seem like I should be able to do this...
                req.headers.host = target;
                options.target = 'https://' + target;
                verboseLog('rewrite', url, host, target);
            }
        } else {
            verboseLog('loopback', url, host, loopback);
        }
        proxy.web(req, res, options);
    });

    console.log('\nproxy listening on port ' + (listenport + '').bold.white);
    console.log('proxy redirecting to port ' + (targetport + '').bold.white);
    console.log('using ' + ciServer.bold.white + ' as the ci server\n');
    server.listen(listenport);
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
