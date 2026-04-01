'use strict';

var factory = require('./factory.cjs');
var defaults = require('./defaults.cjs');



exports.factory = factory.factory;
exports.createRSAOAEP = defaults.createRSAOAEP;
exports.createRSAOAEP256 = defaults.createRSAOAEP256;
