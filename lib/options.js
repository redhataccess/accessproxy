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

exports.set('defaultHosts', {
    ci: 'ci.foo.redhat.com',
    qa: 'qa.foo.redhat.com',
    stage: 'stage.foo.redhat.com',
    prod: 'prod.foo.redhat.com'
});
