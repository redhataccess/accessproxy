'use strict';
var inquirer = require('inquirer');
var hostile = require('hostile');
var config = require('../config');
var options = require('../options');
var defaultHosts = options.get('defaultHosts');
var hostIp = '127.0.0.1';

function checkHostsPermissions(cb) {
    var testHost = 'accessproxy.perm.testing';
    var hasPerms = false;
    hostile.set(hostIp, testHost, function(err) {
        if (err) {
            return cb(hasPerms);
        }
        hostile.remove(hostIp, testHost, function(err) {
            if (err) {
                return cb(hasPerms);
            }
            hasPerms = true;
            return cb(hasPerms);
        });
    });
}


module.exports = function() {
    var hosts = config.get('hosts') || defaultHosts;
    var questions = [{
        type: 'input',
        name: 'ci',
        message: 'What should we use for the ci host?',
        default: hosts.ci
    }, {
        type: 'input',
        name: 'prod',
        message: 'What should we use for the prod host?',
        default: hosts.prod
    }];
    checkHostsPermissions(function(hasPerms) {
        if (!hasPerms) {
            console.error('Could not write to hosts file. Try running as sudo?');
            return process.exit(1);
        }
        inquirer.prompt(questions, function(answers) {
            var hosts = [];
            for (var key in answers) {
                hosts.push(answers[key]);
            }
            hostile.set(hostIp, hosts.join(' '));
            config.set('hosts', answers);
        });
    });
};
