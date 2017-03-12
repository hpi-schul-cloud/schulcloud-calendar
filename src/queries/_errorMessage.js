const logger = require('../infrastructure/logger');

function errorMessage(query, error) {
    logger.error('Error processing ' + query + '\n' + error);
}

module.exports = errorMessage;
