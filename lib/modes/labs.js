'use strict';
var options = require('../options');
var logger = require('../logger');
var regexes = require('../regexes');

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
        var target;
        if (regexes.prodRegex.test(host)) {
            target = 'access.redhat.com';
        } else if (regexes.ciRegex.test(host)) {
            target = options.get('ciServer');
        }
        if (target) {
            // Does not seem like I should be able to do this...
            req.headers.host = target;
            proxyOpts.target = 'https://' + target;
            logger.log('rewrite', url, host, target);
        }
    } else {
        logger.log('loopback', url, host, loopback);
    }
    return [req, res, proxyOpts];
};
