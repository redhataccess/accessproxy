'use strict';

var Configstore = require('configstore');
var conf;

module.exports.init = function(name) {
    conf = new Configstore(name);
};

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
