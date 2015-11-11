#!/usr/bin/env node

'use strict';

var
    program = require('commander'),
    commands = require('./lib/commands'),
    options = require('./lib/options'),
    updateNotifier = require('update-notifier'),
    pkg = require('./package.json'),
    version = pkg.version;

program
    .version(version)
    .option('-l, --listen <n>', 'The port to listen on', 1337)
    .option('-t, --target <n>', 'The port to loopback to', 9000)
    .option('-T, --hostname <hostname>', 'The hostname to loopback to')
    .option('-p, --proxy <hostname>', 'The hostname to proxy to')
    .option('-v, --verbose', 'Enable verbose logging')
    .option('-m, --mode <mode>', 'Proxy mode (labs, portal, local, or mixed)', 'labs')
    .option('-s, --static <path>', 'Path to serve up static assets', './');

program
    .command('configure')
    .description('Configures proxy options')
    .action(commands.configure);

program
    .command('default')
    .description('Start proxy server')
    .action(commands._default);

program.parse(process.argv);
options.mixin(program);

if (!program.args.length) {
    // Not sure why commander doesn't handle this case...
    commands._default();
}

updateNotifier({
    packageName: pkg.name,
    packageVersion: pkg.version
}).notify({
    defer: false
});
