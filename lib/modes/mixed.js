'use strict';
var labs = require('./labs');
var regexes = require('../regexes');
var options = require('../options');
var logger = require('../logger');

module.exports = function(req, res) {
    var host = req.headers.host,
        url = req.url;
    if (regexes.portalRewriteRegex.test(url)) {
        var staticLoopback = 'https://' + options.get('static');
        var proxyOpts = {
            target: staticLoopback,
            secure: false,
            prependPath: false
        };
        req.url = req.url.replace('/webassets/avalon/', '/');
        var targethostname = 'localhost',
            targetport = 9000;
        if (options.get('hostname')) {
            targethostname = options.get('hostname');
        }
        if (options.get('port')) {
            targetport = options.get('port');
        }
        targethostname = targethostname + ':' + (targetport + 1);
        // Does not seem like I should be able to do this...
        req.headers._host = req.headers.host;
        req.headers.host = targethostname;
        proxyOpts.target = 'http://' + targethostname;
        logger.log('static rewrite', url, host, targethostname);
        return [req, res, proxyOpts];
    }
    return labs(req, res);
};
