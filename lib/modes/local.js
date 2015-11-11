'use strict';
var options = require('../options');
var logger = require('../logger');
var regexes = require('../regexes');
var utils = require('../utils');
var format = require('util').format;

var LOG_FORMAT = '%s (%s) %s';

module.exports = function (req, res) {
    var host = req.headers.host,
        url = req.url;
    var targethostname = 'localhost',
        targetport = 9000;
    if (options.get('hostname')) {
        targethostname = options.get('hostname');
    }
    if (options.get('target')) {
        targetport = options.get('target');
    }
    var loopback = 'http://' + targethostname + ':' + targetport;
    var proxyOpts = {
        target: loopback,
        secure: false,
        prependPath: false
    };

    if (regexes.localRewriteRegex.test(url)) {
        var target = utils.serverMap(host);
        if (target) {
            req.headers._host = req.headers.host;
            req.headers.host = target;
            proxyOpts.target = 'https://' + target;
            logger.log(format(LOG_FORMAT, req.method, req.connection.remoteAddress, 'rewrite'), url, host, target);
        }
    } else if(/^\/r\/.*/.test(url)) {
        // API is also running locally; invoke it directly
        proxyOpts.target = 'http://localhost:9002';
        logger.log(format(LOG_FORMAT, req.method, req.connection.remoteAddress, 'api'), url, host, proxyOpts.target);
    } else {
        logger.log(format(LOG_FORMAT, req.method, req.connection.remoteAddress, 'ui'), url, host, loopback);
    }
    return [req, res, proxyOpts];
};
