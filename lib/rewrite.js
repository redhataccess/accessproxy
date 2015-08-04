'use strict';
var regexes = require('./regexes');
var utils = require('./utils');
var path = require('path');
var url = require('url');
var ignoreExts = ['.css', '.js', '.png', '.jpg', '.woff', '.svg'];

function isServices(pRes) {
    return (regexes.servicesRegex.test(pRes.req.path));
}

function isHtml(pRes, req) {
    var ext = path.extname(req.url);
    if (ext && ignoreExts.indexOf(ext) !== -1) {
        return false;
    }
    if (!pRes.headers || !pRes.headers['content-type']) {
        return false;
    }
    return pRes.headers['content-type'].indexOf('html') !== '-1';
}

function isRedirect(pRes) {
    return (pRes.headers['location'] && pRes.statusCode === 301 || pRes.statusCode === 302);
}

function rewriteRedirect(pRes, req) {
    var u = url.parse(pRes.headers['location']);
    u.host = req.headers._host;
    pRes.headers['location'] = u.format();
}


module.exports = function (pRes, req, res) {
    if (isRedirect(pRes) && req.headers._host) {
        return rewriteRedirect(pRes, req, res);
    }
    if (!isServices(pRes) && !isHtml(pRes, req)) {
        return;
    }
    var host = req.headers._host;
    var toReplace = utils.serverMap(host);
    if (!toReplace) {
        return;
    }

    var _write = res.write;
    var _writeHead = res.writeHead;
    var str = '';
    pRes.on('data', function (data) {
        str += data;
    });
    pRes.on('end', function () {
        str = str.replace(new RegExp(toReplace, 'g'), host);
        _write.call(res, str);
    });
    res.write = function () {
        // shh. It'll be over soon little guy
    };
    res.writeHead = function (code, headers) {
        res.removeHeader('Content-Length');
        if (headers) {
            delete headers['content-length'];
        }
        _writeHead.apply(res, arguments);
    };

};
