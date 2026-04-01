'use strict';

var factory = require('./factory.cjs');
var defaults = require('./defaults.cjs');



exports.factory = factory.factory;
exports.createHS256 = defaults.createHS256;
exports.createHS512 = defaults.createHS512;
exports.createRS256 = defaults.createRS256;
exports.createRS512 = defaults.createRS512;
