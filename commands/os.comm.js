/*
 * OS COMMANDS
 */

var ME     = module.exports;
var config = require('config-ninja');
var shell  = require('../modules/shell');

/*
 * Updates the system.
 */
ME['update'] = function (req, res) {

  // TO DO: Update command,

};

/*
 * Reboot the system.
 * [params]
 *  grace (int>15) The grace period to wait before rebooting the system.
 */
ME['reboot'] = function (req, res) {

  var grace = req.body.grace || config.shutdownGrace;
  var flags = '-r -i6 -g' + grace + ' "*** Rebooting Now! ****"';

  shell.exec('shutdown', flags, function (err) {
    if (err) { return res.errorOut(500, 'Command failed.'); }
    return res.dataOut(true);
  });

};

/*
 * Shut down the system.
 * [params]
 *  grace (int>15) The grace period to wait before rebooting the system.
 */
ME['shutdown'] = function (req, res) {

  var grace = req.body.grace || config.shutdownGrace;
  var flags = '-y -i6 -g' + grace + ' "*** Shutting Down Now! ****"';

  shell.exec('shutdown', flags, function (err) {
    if (err) { return res.errorOut(500, 'Command failed.'); }
    return res.dataOut(true);
  });

};