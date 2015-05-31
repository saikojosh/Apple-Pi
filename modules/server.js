/*
 * SERVER
 */

var ME       = module.exports;
var http     = require('http');
var async    = require('async');
var config   = require('config-ninja');
var security = require('./security');

/*
 * Boot the server and attach the handler method.
 * callback(err, port);
 */
ME.boot = function (port, callback) {

  var handler = ME.handleRequests.bind(ME);

  http.createServer(handler).listen(port, function (err) {
    if (err) { return callback(err); }
    return callback(null, port);
  });

};

/*
 * Handles each incoming request.
 */
ME.handleRequests = function (req, res) {

  var module, command;

  // Add helper methods to the response (whilst maintaining the scope to 'this').
  res.dataOut  = function (success, output, code) { ME.resDataOut.call (ME, req, res, success, output, code); };
  res.errorOut = function (code, customMsg)       { ME.resErrorOut.call(ME, req, res, code, customMsg);       };

  async.waterfall([

    // Ensure the command exists.
    function validateCommand (next) {

      // Split up the URL.
      var urlParts = req.url.match(/\/([a-z0-9]+)\/([a-z0-9]+)\/?/i);
      if (!urlParts) { return next('Invalid URL.'); }

      // Load the module.
      module = require('../commands/' + urlParts[1] + '.comm');
      if (!module || typeof module !== 'object') {
        return next('Invalid module.');
      }

      // Get the command.
      command = module[urlParts[2]];
      if (!command || typeof command !== 'function') {
        return next('Invalid command.');
      }

      // Continue.
      return next(null);

    },

    // Ensure we get the body data if this is a
    function collectBodyData (next) {

      // No post data.
      if (req.method !== 'POST') {
        req.body = null;
        return next(null);
      }

      // Get the body and immediately call next.
      return ME.collectBodyData(req, function (err, body) {

        // Save the processed body to the request.
        req.body = body;

        if (err) { return next(err); }
        return next(null);

      });

    },

    // Ensure the request is secure.
    function validateRequest (next) {

      security.validateRequest(req, function (err) {
        if (err) { return next('Failed security check.'); }
        return next(null);
      });

    }

  ], function (err) {

    if (err) {
      var errCode = (typeof err === 'number' ? err : 500);
      var errMsg  = (typeof err === 'string' ? err : null);
      return res.errorOut(errCode, errMsg);
    }

    // Run the command.
    return command(req, res);

  });

};

/*
 * Collect any incoming POST body data.
 * callback(err, body);
 */
ME.collectBodyData = function (req, callback) {

  // We are going to be receiving post data.
  var body         = '';
  var maxPostBytes = (1024 * 1024 * config.maxPostMB);

  // Receive some data manually.
  req.on('data', function (data) {

    // Add the next chunk of data.
    body += data;

    // If the body grows too big...
    if (body.length > maxPostBytes) { return callback(413, body); }

  });

  // Request finished, handle the route with POST data.
  req.on('end', function () {

    // Can we parse a query string?
    if (req.headers['content-type'].match(/application\/x-www-form-urlencoded/gi)) {
      body = qs.parse(body);
      return callback(null, body);
    }

    // Can we parse JSON?
    else if (req.headers['content-type'].match(/application\/json/gi)) {
      try {
        body = JSON.parse(body);
      }
      catch (e) {
        return callback('Unable to parse JSON POST body.', body);
      }
      return callback(null, body);
    }

  });

};

/*
 * A response helper method to output a success message.
 */
ME.resDataOut = function (req, res, success, output, code) {
  code = code || 200;

  // Construct the response.
  var data = {
    success: success,
    code:    code,
    output:  output
  };

  // Output the data.
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));

};

/*
 * A response helper method to output a HTTP error message.
 */
ME.resErrorOut = function (req, res, code, customMsg) {

  // What message to return?
  var msg = '';
  switch (code) {
    case 404: msg = 'Not Found';                break;
    case 413: msg = 'Request Entity Too Large'; break;
    case 500: msg = 'Internal Server Error';    break;
  }

  // Construct the response.
  var data = {
    success: false,
    code:    code,
    error:   'HTTP Error: ' + msg,
    human:   customMsg || null
  };

  // Output the error message.
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));

};