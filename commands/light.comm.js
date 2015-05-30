/*
 * LIGHT COMMANDS
 */

var ME    = module.exports;
var async = require('async');
var light = require('../modules/light');

/*
 * Set the light to a specific level.
 */
ME['set'] = function (req, res) {

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

  var duration  = (1000 * 60 * req.body.duration);  //duration in minutes.
  var steps     = 255;
  var pause     = duration / steps;
  var curLevel  = 0;
  var firstStep = true;

  // Increase the light level in steps.
  async.whilst(function test () {
    return (curLevel < steps);
  }, function (next) {

    light.set(curLevel, function (err) {

      if (err) { return next(err); }

      // We only need to send a success response on the first step (no need to
      // wait X minutes and no need to return).
      if (firstStep) {
        res.dataOut(true);
        firstStep = false;
      }

      // Continue after a pause.
      curLevel++;
      setTimeout(next, pause);

    });

  }, function (err) {

    // We only need to send a response if we get an error on the first step.
    if (err && firstStep) {
      return res.errorOut(500, 'Failed to set light value.');
    }

  });

};

/*
 * Gradually decrease the light level over a set period of time.
 */
ME['sleep'] = function (req, res) {

  var duration  = (1000 * 60 * req.body.duration);  //duration in minutes.
  var steps     = 255;
  var pause     = duration / steps;
  var curLevel  = steps;
  var firstStep = true;

  // Increase the light level in steps.
  async.whilst(function test () {
    return (curLevel > 0);
  }, function (next) {

    light.set(curLevel, function (err) {

      if (err) { return next(err); }

      // We only need to send a success response on the first step (no need to
      // wait X minutes and no need to return).
      if (firstStep) {
        res.dataOut(true);
        firstStep = false;
      }

      // Continue after a pause.
      curLevel--;
      setTimeout(next, pause);

    });

  }, function (err) {

    // We only need to send a response if we get an error on the first step.
    if (err && firstStep) {
      return res.errorOut(500, 'Failed to set light value.');
    }

  });

};