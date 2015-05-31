/*
 * LIGHT GPIO
 */

var GPIO = require('onoff').Gpio;

/*
 * Export the GPIO for the light.
 */
module.exports = [
  new GPIO(2,  'out'),
  new GPIO(3,  'out'),
  new GPIO(4,  'out'),
  new GPIO(7,  'out'),
  new GPIO(8,  'out'),
  new GPIO(9,  'out'),
  new GPIO(10, 'out'),
  new GPIO(11, 'out')
];