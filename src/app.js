const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const config = require('./config');
const logger = require('./infrastructure/logger')
const requestLog = require('./infrastructure/RequestLogger');
const index = require('./routes');
const calendar = require('./routes/calendar');
const events = require('./routes/events');
const subscriptions = require('./routes/subscriptions');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


if (config.REQUEST_LOGGING_ENABLED === true) {
	app.use((req, res, next) => {
		requestLog(`${req.method} ${req.originalUrl}` );
		next();
	});
}
app.use('/', index);
app.use('/', calendar);
app.use('/', events);
app.use('/', subscriptions);

// catch 404 and forward to error handler
app.use(function (req, res) {
	const error = new Error('Not Found');
	error.status = 404;
	error.title = 'Page Not Found';
	res.status(404).send(error);
});

// error handler
app.use(function (err, req, res, next) {
	logger.error(err);

	const { message, status = 500, title = 'Internal Server Error' } = err;

	const errorMessage = {
		errors: [{
			detail: message || '',
			title,
			status
		}]
	};

	if (res && !res.headersSent){
		res.contentType('application/json').status(status).send(errorMessage);
	} else{
		logger.error('res unavailable or headers already sent');
	}
});

module.exports = app;
