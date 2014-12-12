'use strict';
var regexes = require('./regexes');
var utils = require('./utils');
var path = require('path');
var zlib = require('zlib');
var ignoreExts = ['.css', '.js'];

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


module.exports = function(pRes, req, res) {
    if (!isServices(pRes) && !isHtml(pRes, req)) {
        return;
    }
    var host = req.headers._host || req.socket.servername;
    var toReplace = utils.serverMap(host);
    if (!toReplace) {
        return;
    }
    var encoding = pRes.headers['content-encoding'];
    var isGzip = (encoding && encoding === 'gzip');

    var _write = res.write;
    var _writeHead = res.writeHead;
    var _end = res.end;
    var str = '';
    if (isGzip) {
        var chunks = [];
        res.end = function() {
            var args = arguments;
            var buffer = Buffer.concat(chunks);
            zlib.gunzip(buffer, function(error, decoded) {
                var str = decoded.toString();
                str = str.replace(new RegExp(toReplace, 'g'), host);
                _write.call(res, str);
                _end.apply(res, args);
            });
        };
        res.write = function(chunk) {
            // om nom nom nom
            chunks.push(chunk);
        };
    } else {
        pRes.on('data', function(data) {
            str += data;
        });
        pRes.on('end', function() {
            str = str.replace(new RegExp(toReplace, 'g'), host);
            _write.call(res, str);
        });
        res.write = function() {
            // shh. It'll be over soon little guy
        };
    }
    res.writeHead = function(code, headers) {
        res.removeHeader('Content-Length');
        if (headers) {
            delete headers['content-length'];
        }
        if (isGzip) {
            res.removeHeader('Content-Encoding');
            if (headers) {
                delete headers['content-encoding'];
            }
        }
        _writeHead.apply(res, arguments);
    };

};
