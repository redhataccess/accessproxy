'use strict';
var options = require('../options');
var logger = require('../logger');
var regexes = require('../regexes');
var utils = require('../utils');

module.exports = function(req, res) {
    var host = req.headers.host,
        url = req.url;
    var targethostname = 'localhost',
        targetport = 9000;
    if (options.get('hostname')) {
        targethostname = options.get('hostname');
    }
    if (options.get('port')) {
        targetport = options.get('port');
    }
    var loopback = 'http://' + targethostname + ':' + targetport;
    var proxyOpts = {
        target: loopback,
        secure: false,
        prependPath: false
    };

    if (regexes.labsRewriteRegex.test(url)) {
        var target = utils.serverMap(host);
        if (target) {
            // Does not seem like I should be able to do this...
            req.headers._host = req.headers.host;
            req.headers.host = target;
            proxyOpts.target = 'https://' + target;
            logger.log('rewrite', url, host, target);
        }
    } else {
        logger.log('loopback', url, host, loopback);
    }
    return [req, res, proxyOpts];
};
