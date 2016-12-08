'use strict';

const http = require('http')
const send = require('send');
const parseUrl = require('parseurl')

function parseRange (range) {
  return (((range || '')
    .split('=')[1] || '')
    .split('-') || [])
    .map(n => parseInt(n) || undefined);
}

module.exports = class HTTPServer {

  constructor ( port ) {
    const server = http.createServer(function onRequest (req, res) {
      const range = parseRange(req.headers.range);

      send(req, parseUrl(req).pathname, {
        root: 'build/public/',
        start: range[0],
        end: range[1]
      })
      .pipe(res)
    });

    server.listen(port, () => {
      console.log(`Hello Dave! I"m listening on ${port}.`);
    });
  }
};
