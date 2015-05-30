/*
 * SHELL
 */

var ME           = module.exports;
var childProcess = require('child_process');
var exec         = childProcess.exec;

/*
 * Execute the given command with the given options.
 * callback(err);
 */
ME.exec = function (command, flags, callback) {
  callback = require('func-it')(callback);

  var fullCommand = command + (flags ? ' ' + flags : '');

  childProcess.exec(fullCommand, function (err, stdout, stderr) {
    if (err) { return callback(err); }
    return callback(null);
  });

};