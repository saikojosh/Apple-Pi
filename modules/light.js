/*
 * LIGHT
 */

var ME        = module.exports;
var async     = require('async');
var lightGPIO = require('./lightGPIO');

/*
 * Sets the light to the given value.
 * callback(err);
 */
ME.set = function (value, callback) {
  callback = require('func-it')(callback);

  // Parse the light value.
  try {
    value = parseInt(value, 10);
  }
  catch (err) {
    return callback('Invalid light value.');
  }

  // Check the light value.
  if (value < 0 || value > 255) { return callback('Invalid light value.'); }

  // Convert to binary.
  var binVal = valueToBinary(value);

  // Set each pin.
  async.forEachOf(lightGPIO, function (pin, key, next) {

    // Write the pin and call the next method.
    pin.write(binVal[key], next);

  }, function (err) {
    if (err) { return callback(err); }
    return callback(null);
  });

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