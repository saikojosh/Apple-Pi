/*
 * LIGHT COMMANDS
 */

var ME    = module.exports;
var light = require('../modules/light');

/*
 * Set the light to a specific level.
 */
ME['set'] = function (req, res) {

  // Change the light value.
  light.set(req.body.value, function (err) {
    if (err) { return res.errorOut(500, 'Failed to set light value.'); }
    res.dataOut(true);
  });

};

/*
 * Turn the light fully off.
 */
ME['off'] = function (req, res) {

};

/*
 * Turn the light fully on.
 */
ME['on'] = function (req, res) {

};

/*
 * Gradually increase the light level over a set period of time.
 */
ME['wake-up'] = function (req, res) {

};

/*
 * Gradually decrease the light level over a set period of time.
 */
ME['sleep'] = function (req, res) {

};