/*
 * OS COMMANDS
 */

var ME    = module.exports;
var shell = require('../modules/shell');

/*
 * Reboot the system.
 */
ME['reboot'] = function (req, res) {

  shell.exec('shutdown', '-r -i6 -g15 "*** Rebooting Now! ****"', function (err) {
    if (err) { return res.errorOut(500, 'Command failed.'); }
    return res.dataOut(true);
  });

};

/*
 * Shut down the system.
 */
ME['shutdown'] = function (req, res) {

  shell.exec('shutdown', '-y -i6 -g15 "*** Shutting Down Now! ****"', function (err) {
    if (err) { return res.errorOut(500, 'Command failed.'); }
    return res.dataOut(true);
  });

};