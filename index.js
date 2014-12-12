#!/usr/bin/env node
'use strict';

var
    program = require('commander'),
    commands = require('./lib/commands'),
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
    .option('-s, --static <path>', 'Path to serve up static assets', './');

program
    .command('*')
    .description('')
    .action(commands._default);

program.parse(process.argv);
options.mixin(program);

if (!program.args.length) {
    commands._default();
}
