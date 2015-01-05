'use strict';

var Configstore = require('configstore');
var fs = require('fs');
var pkg = require('../package.json');

var conf = new Configstore(pkg.name);
try {
    // Lucky 7s
    fs.chmodSync(conf.path, '777');
} catch (e) {}

module.exports.set = function(key, val) {
    conf.set(key, val);
};

module.exports.get = function(key) {
    return conf.get(key);
};

module.exports.del = function(key) {
    conf.del(key);
};

module.exports.all = function() {
    return conf.all;
};
