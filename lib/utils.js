'use strict';
var config = require('./config');
var regexes = require('./regexes');

exports.serverMap = function(host) {
    var servers = config.get('servers');
    if (regexes.prodRegex.test(host)) {
        return servers.prod;
    } else if (regexes.fteRegex.test(host)) {
        return servers.fte;
    } else if (regexes.ciRegex.test(host)) {
        return servers.ci;
    } else if (regexes.qaRegex.test(host)) {
        return servers.qa;
    } else if (regexes.stageRegex.test(host)) {
        return servers.stage;
    }
};
