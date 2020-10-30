const { LOG_LEVEL, NODE_ENV } = require('../config');
const { createLogger, getDevelopFormat, getTestFormat, getProductionFormat } = require('./loggerUtils');

let selectedFormat;
switch (NODE_ENV) {
	case 'test':
		selectedFormat = getTestFormat();
		break;
	case 'production':
		selectedFormat = getProductionFormat();
		break;
	case 'develop':
	default:
		selectedFormat = getDevelopFormat();
}

const logger = createLogger(selectedFormat, LOG_LEVEL);

module.exports = logger;

