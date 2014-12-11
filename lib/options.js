'use strict';
var options = {};

exports.set = function(key, val) {
    options[key] = val;
};

exports.get = function(key) {
    return options[key];
};

exports.mixin = function(mixinObj) {
    var keys = Object.keys(mixinObj);
    var i = keys.length;
    while (i--) {
        options[keys[i]] = mixinObj[keys[i]];
    }
    return options;
};
