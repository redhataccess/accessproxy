'use strict';
var labs = require('./labs');
var regexes = require('../regexes');
var options = require('../options');
var logger = require('../logger');
var utils = require('../utils');

module.exports = function (req, res) {
    var host = req.headers.host,
        url = req.url,
        staticLoopback = 'https://' + options.get('static');

    var proxyOpts = {
        target: staticLoopback,
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
        targethostname = targethostname + ':' + (parseInt(targetport, 10) + 1);
        // Does not seem like I should be able to do this...
        req.headers._host = req.headers.host;
        req.headers.host = targethostname;
        proxyOpts.target = 'http://' + targethostname;
        logger.log('static rewrite', url, host, targethostname);
        return [req, res, proxyOpts];
    } else if (regexes.loginRewriteRegex.test(url)) {
        var target = utils.serverMap(host);
        req.headers.host = target;
        proxyOpts.target = 'https://' + target;
        logger.log('login', url, host, target);
        return [req, res, proxyOpts];
    }
    return labs(req, res);
};
