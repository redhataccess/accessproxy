'use strict';

exports.ciRegex = /(^foo\.redhat\.com)/;
exports.prodRegex = /(^prod\.foo\.redhat\.com)/;
exports.labsRewriteRegex = /^\/(rs|chrome_themes|webassets|services).*/;
exports.portalRewriteRegex = /^\/(chrome_themes|webassets).*/;
exports.protalStyleRewriteRegex = /^\/(chrome_themes|webassets).*(.css)/;
