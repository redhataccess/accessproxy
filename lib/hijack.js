'use strict';
var regexes = require('./regexes');

function isServices(pRes) {
    return (regexes.servicesRegex.test(pRes.req.path));
}

function isHtml(pRes) {
    if (!pRes.headers || !pRes.headers['content-type']) {
        return false;
    }
    return pRes.headers['content-type'].indexOf('html') !== '-1';
}

module.exports = function(pRes, req, res) {
    if (!isServices(pRes) && !isHtml(pRes)) {
        return;
    }
    var _write = res.write;
    var _writeHead = res.writeHead;
    var str = '';
    pRes.on('data', function(data) {
        str += data;
    });
    pRes.on('end', function() {
        var replacementHost = 'https://foo.redhat.com:1337';

        str = str.replace(regexes.portalHostHijack, '$1 "' + replacementHost + '"');
        str = str.replace(regexes.portalWhitelistHijack, '$1"' + replacementHost + '"');
        str = str.replace(regexes.absoluteRegex, '/');
        _write.call(res, str);
    });
    res.writeHead = function(code, headers) {
        res.removeHeader('Content-Length');
        if (headers) {
            delete headers['content-length'];
        }
        _writeHead.apply(res, arguments);
    };
    res.write = function() {
        // shh. It'll be over soon little guy
    };

};
