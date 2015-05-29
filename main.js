/*
 * APPLE PI
 * Main entry point.
 */

var path        = require('path');
var baseDir     = __dirname;
var configDir   = path.join(baseDir, '/config');
var packageJSON = require('./package.json');
var appVersion  = packageJSON.version;
var nodeVersion = process.version;
var env         = process.env.NODE_ENV || 'development';
var config      = require('config-ninja').init(configDir, env);
var logger      = require('log-ninja').init(config.environment.level);
var async       = require('async');
var moment      = require('moment');
var server      = require('./modules/server');

// Start boot process.
async.waterfall([

  // Show some basic boot info.
  function bootInfo (next) {

    logger.space();
    logger.title('Starting ' + config.appName + ' [v' + appVersion + '] in [' + config.environment.name + '] mode...');
    logger.box('info', 'Node Version: ' + nodeVersion);
    logger.box('info', 'Boot Time: ' + moment().format('DD/MM/YYYY HH:mm:ss'));
    logger.important('------------------------------------------------------');

    // Continue.
    return next(null);

  },

  // Prepare the web server.
  function (next) {

    server.boot(config.port, function (err, port) {

      if (err) {
        logger.box('fail', 'Boot server.');
        return next(err);
      }

      // Success!
      logger.box('ok', 'Boot server.');
      return next(null);

    });

  }

], function (err) {

  if (err) {
    logger.error('Failed to boot.').error(err).space();
    return process.exit(1);
  }

  logger.success('Ready for business.').space();

});