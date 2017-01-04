const consoleError = require('../../utils/consoleError');

function errorMessage(query, error) {
    consoleError("Error processing " + query);
    consoleError(error);
}

module.exports = errorMessage;
