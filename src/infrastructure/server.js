#!/usr/bin/env node
const app = require('../app');
const http = require('http');
const logger = require('../infrastructure/logger');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const requestHandler = (request, response) => { // eslint-disable-line no-unused-vars
    logger.log(request.url);
};

const server = http.createServer(app, requestHandler);

server.listen(port, (err) => {
    if (err) {
        return logger.error('Server was not able to start. Is the port already used by another service?');
    }
});
server.on('error', onError);

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}

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
