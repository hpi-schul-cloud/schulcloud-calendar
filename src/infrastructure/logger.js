const winston = require('winston');
require('winston-daily-rotate-file');
const config = require('../config');
const fs = require('fs');

const logDir = __dirname + '/../../' + 'logs';

const consoleLog = new (winston.transports.Console)({
    level: config.LOG_LEVEL,
    json: false,
    handleExceptions: true,
    humanReadableUnhandledException: true
});

const fileLog = new winston.transports.DailyRotateFile({
    filename: config.LOG_LEVEL + '.log',
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    dirname: logDir,
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: config.LOG_LEVEL,
    json: false
});

function checkIfFolderExistsAndReturnLogger() {
    if (!fs.existsSync(logDir))
        fs.mkdirSync(logDir);
    return new (winston.Logger)({
        transports: (process.env.NODE_ENV !== 'test') ? [consoleLog, fileLog] : []
    });
}

module.exports = checkIfFolderExistsAndReturnLogger();