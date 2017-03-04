const winston = require('winston');
require('winston-daily-rotate-file');
const config = require('../config');

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
    dirname: __dirname + '/../../' + 'logs',
    handleExceptions: true,
    humanReadableUnhandledException: true,
    level: config.LOG_LEVEL,
    json: false
});

const logger = new (winston.Logger)({
    transports: (process.env.NODE_ENV !== 'test') ? [consoleLog, fileLog] : []
});

module.exports = logger;