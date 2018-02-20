/**
 * @module veranet/version
 */

'use strict';

var semver = require('semver');
var assert = require('assert');

module.exports = {
  /**
   * @constant {string} software - The current software version
   */
  software: require('../package').version,
  /**
   * Returns human readable string of versions
   * @function
   * @returns {string}
   */
  toString: function() {
    let { software, protocol } = module.exports;
    return `es-chain-module v${software}`;
  }
};
