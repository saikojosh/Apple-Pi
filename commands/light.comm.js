/*
 * LIGHT COMMANDS
 */

var ME     = module.exports;
var async  = require('async');
var logger = require('log-ninja');
var light  = require('../modules/light');

/*
 * Set the light to a specific level.
 */
ME['set'] = function (req, res) {

  logger.info('[light.comm] SET ' + req.body.value);

  // Change the light value.
  light.set(req.body.value, function (err) {
    if (err) { return res.errorOut(500, 'Failed to set light value.'); }
    return res.dataOut(true);
  });

};

/*
 * Turn the light fully off.
 */
ME['off'] = function (req, res) {

  logger.info('[light.comm] OFF');

  // Turn off the light completely.
  light.set(0, function (err) {
    if (err) { return res.errorOut(500, 'Failed to set light value.'); }
    return res.dataOut(true);
  });

};

/*
 * Turn the light fully on.
 */
ME['on'] = function (req, res) {

  logger.info('[light.comm] ON');

  // Turn on the light completely.
  light.set(255, function (err) {
    if (err) { return res.errorOut(500, 'Failed to set light value.'); }
    return res.dataOut(true);
  });

};

/*
 * Gradually increase the light level over a set period of time.
 */
ME['wake-up'] = function (req, res) {

  logger.info('[light.comm] WAKE UP ' + req.body.duration);

  light.graduate(0, 255, req.body.duration, function (err) {
    if (err) { return res.errorOut(500, 'Failed to set light value.'); }
    return res.dataOut(true);
  });

};

/*
 * Gradually decrease the light level over a set period of time.
 */
ME['sleep'] = function (req, res) {

  logger.info('[light.comm] SLEEP ' + req.body.duration);

  light.graduate(255, 0, req.body.duration, function (err) {
    if (err) { return res.errorOut(500, 'Failed to set light value.'); }
    return res.dataOut(true);
  });

};