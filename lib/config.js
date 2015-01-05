'use strict';

var Configstore = require('configstore');
var pkg = require('../package.json');

var conf = new Configstore(pkg.name);

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
