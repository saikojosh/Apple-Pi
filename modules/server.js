/*
 * SERVER
 */

var ME   = module.exports;
var http = require('http');

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

  // Add helper methods to the response (whilst maintaining the scope to 'this').
  res.respond  = function (data, code)      { ME.resRespond.call (ME, req, res, data, code);      };
  res.errorOut = function (code, customMsg) { ME.resErrorOut.call(ME, req, res, code, customMsg); };

  // Split up the URL.
  var urlParts = req.url.match(/\/([a-z0-9]+)\/([a-z0-9]+)\/?/i);
  if (!urlParts) { return res.errorOut(500, 'Invalid URL.'); }

  // Load the module.
  var module = require('../commands/' + urlParts[1]);
  if (typeof module !== 'object') { return res.errorOut(500, 'Invalid module.'); }

  // Get the command.
  var command = module[urlParts[2]];
  if (typeof command !== 'function') { return res.errorOut(500, 'Invalid command.'); }

  // Run the command.
  return command(req, res);

};

/*
 * A response helper method to output an object as JSON.
 */
ME.resRespond = function (req, res, data, code) {
  code = code || 200;
  var message = JSON.stringify(data);
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(message);
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

  // Output the error message.
  res.writeHead(code, { 'Content-Type': 'text/plain' });
  res.end('HTTP Error ' + code + (msg ? ' ' + msg : '') + (customMsg ? '\n\n' + customMsg : ''));

};