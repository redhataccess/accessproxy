'use strict';
var config = require('./config');
var options = require('./options');
var hosts = config.get('hosts') || options.get('defaultHosts');

var dotRegex = /\./g,
    escapedDot = '\\.';

var ciHost = hosts.ci.replace(dotRegex, escapedDot),
    prodHost = hosts.prod.replace(dotRegex, escapedDot);

exports.ciRegex = new RegExp('(^' + ciHost + ')');
exports.prodRegex = new RegExp('(^' + prodHost + ')');
exports.labsRewriteRegex = /^\/(rs|chrome_themes|webassets|services).*/;
exports.portalRewriteRegex = /^\/(chrome_themes|webassets).*/;
exports.protalStyleRewriteRegex = /^\/(chrome_themes|webassets).*(.css)/;
exports.servicesRegex = /^\/services.*/;
