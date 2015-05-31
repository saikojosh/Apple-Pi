/*
 * LIGHT
 */

var ME        = module.exports;
var async     = require('async');
var logger    = require('log-ninja');
var lightGPIO = require('./light-gpio');

/*
 * Sets the light to the given value.
 * callback(err);
 */
ME.set = function (value, callback) {
  callback = require('func-it')(callback);

  logger.debug('[light] SET ' + value);

  // Prepare and error check the value.
  value = ME.parseValue(value);
  if (value === false) { return callback('Invalid light value.'); }

  logger.debug('[light] BINARY ' + value.join(','));

  // Set each pin.
  async.forEachOf(lightGPIO, function (pin, key, next) {

    logger.debug('[light] PIN ' + pin.gpio + ' TO ' + value[key]);

    // Write the pin and call the next method.
    pin.write(value[key], next);

  }, function (err) {
    if (err) { return callback(err); }
    return callback(null);
  });

};

/*
 * Gradually increase/decrease the light level over a given duration (in mins).
 */
ME.graduate = function (startValue, endValue, duration, callback) {

  // Error check the values.
  if (ME.parseValue(startValue) === false) { return callback('Invalid light start value.'); }
  if (ME.parseValue(endValue)   === false) { return callback('Invalid light end value.');   }

  // Convert duration from minutes to milliseconds.
  duration = (1000 * 60 * duration);

  var direction = (startValue < endValue ? 'up' : 'down');
  var steps     = Math.abs(endValue - startValue);
  var pause     = duration / steps;
  var curLevel  = startValue;
  var firstStep = true;

  // Increase/decrease the light level in steps.
  async.whilst(function test () {
    return (direction === 'up' ? (curLevel <= endValue) : (curLevel >= endValue));
  }, function run (next) {

    light.set(curLevel, function (err) {

      if (err) { return next(err); }

      // We only need to send a success response on the first step (no need to
      // wait X minutes and no need to return).
      if (firstStep) {
        callback(null);
        firstStep = false;
      }

      // Continue after a pause.
      if (direction === 'up') { curLevel++; } else { curLevel--; }
      setTimeout(next, pause);

    });

  }, function (err) {

    // We only need to send a response if we get an error on the first step.
    if (err && firstStep) {
      return callback('Failed to set light value.');
    }

  });

};

/*
 * Prepare the value and check for errors.
 */
ME.parseValue = function (value) {

  // Parse the light value.
  try {
    value = parseInt(value, 10);
  }
  catch (err) {
    return false;
  }

  // Check the light value.
  if (value < 0 || value > 255) { return false; }

  // Convert to binary.
  return ME.valueToBinary(value);

};

/*
 * Converts a numerical value to an 8-bit binary value split into an array.
 */
ME.valueToBinary = function (value) {

  // Convert the value to an 8-bit binary string.
  var totalLen   = 8;
  var bin        = (value >>> 0).toString(2);

  // Add some zero padding to the front if necessary.
  var paddingLen = (totalLen - bin.length);
  var padding    = (paddingLen > 0 ? new Array(paddingLen + 1).join('0') : '');
  var fullBin    = padding + bin;

  // Split into an array of individual values.
  var output = fullBin.split('');

  // Convert each array index to an integer.
  for (var i = 0, ilen = output.length ; i < ilen ; i++) {
    output[i] = parseInt(output[i], 10);
  }

  return output;

};

/*
 * Tidy up the GPIO (used on process exit).
 */
ME.tidyUp = function () {
  for (var i = 0 ; i < 8 ; i++) {
    if (!lightGPIO.hasOwnProperty(i)) { continue; }
    lightGPIO[i].unexport();
  }
};