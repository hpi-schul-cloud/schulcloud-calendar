//#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
//const debug = require('debug')('schulcloud-calendar:server');
const http = require('http');
const logger = require('../infrastructure/logger');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * actions for all requests:
 * - print request to console log
 */

const requestHandler = (request, response) => { // eslint-disable-line no-unused-vars
    logger.log(request.url);
};

/**
 * Create HTTP server.
 */

const server = http.createServer(app, requestHandler);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, (err) => {
    if (err) {
        return logger.error('Server was not able to start. Is the port already used by another service?');
    }
});
//server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
/*
function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            logger.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
*/
/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
 //   debug('Listening on ' + bind);
}
