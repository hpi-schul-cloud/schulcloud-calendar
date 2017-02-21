const logger = require('../../logging/logger');

function returnSuccessWithoutContent(res) {
    if (res && !res.headersSent)
        res.status(204).send();
    else
        logger.error('res unavailable or headers already sent');
}

module.exports = returnSuccessWithoutContent;
