'use strict';
var options = require('../options');
var logger = require('../logger');
var regexes = require('../regexes');
var utils = require('../utils');

module.exports = function (req, res) {
    var host = req.headers.host,
        url = req.url;

    var target = utils.serverMap(host);
    var loopback = 'https://' + target;

    var proxyOpts = {
        target: loopback,
        secure: false,
        prependPath: false
    };

    if (regexes.portalRewriteRegex.test(url)) {
        req.url = req.url.replace('/webassets/avalon/', '/');
        var targethostname = 'localhost',
            targetport = 9000;
        if (options.get('hostname')) {
            targethostname = options.get('hostname');
        }
        if (options.get('target')) {
            targetport = options.get('target');
        }
        if (targethostname) {
            targethostname = targethostname + ':' + targetport;
            // Does not seem like I should be able to do this...
            req.headers.host = targethostname;
            proxyOpts.target = 'http://' + targethostname;
            logger.log('rewrite', url, host, targethostname);
        }
} else if (regexes.loginRewriteRegex.test(url)) {        req.headers.host = target;
        proxyOpts.target = 'https://' + target;
        logger.log('login', url, host, target);
    } else {
        req.headers._host = req.headers.host;
        req.headers.host = target;
        proxyOpts.target = 'https://' + target;
        logger.log('loopback', url, host, loopback);
    }
    return [req, res, proxyOpts];
};
