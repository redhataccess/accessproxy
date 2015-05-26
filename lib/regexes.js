'use strict';
var config = require('./config');
var options = require('./options');
var hosts = config.get('hosts') || options.get('defaultHosts');

var dotRegex = /\./g,
    escapedDot = '\\.';

var fteHost = hosts.fte.replace(dotRegex, escapedDot),
    ciHost = hosts.ci.replace(dotRegex, escapedDot),
    qaHost = hosts.qa.replace(dotRegex, escapedDot),
    stageHost = hosts.stage.replace(dotRegex, escapedDot),
    prodHost = hosts.prod.replace(dotRegex, escapedDot);

exports.fteRegex = new RegExp('(^' + fteHost + ')');
exports.ciRegex = new RegExp('(^' + ciHost + ')');
exports.qaRegex = new RegExp('(^' + qaHost + ')');
exports.stageRegex = new RegExp('(^' + stageHost + ')');
exports.prodRegex = new RegExp('(^' + prodHost + ')');
exports.labsRewriteRegex = /^\/(login|r|rs|chrome_themes|webassets|services).*/;
exports.portalRewriteRegex = /^\/(login|chrome_themes|webassets).*/;
exports.protalStyleRewriteRegex = /^\/(chrome_themes|webassets).*(.css)/;
exports.servicesRegex = /^\/services.*/;
