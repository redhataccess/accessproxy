'use strict';
var options = require('./options');

exports.log = function (type, url, source, target) {
    if (options.get('verbose')) {
        console.log(type + ' ' + (source + url).red + ' ---> ' + (target + url).green);
    }
};
