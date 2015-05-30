/*
 * SECURITY
 */

var ME           = module.exports;
var securityCode = require('../config/security-code.json').code;

/*
 * Validates the request before allowing it to continue.
 * callback(err);
 */
ME.validateRequest = function(req, callback) {

  // TO DO: Check the IP address.
  // TO DO: Check the rotating code.

  // Check the security code.
  if (req.body.sc !== securityCode) { return callback(true); }

  // All OK.
  return callback(null);

};