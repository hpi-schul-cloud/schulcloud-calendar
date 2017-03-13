const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const index = require('./routes');
const calendar = require('./routes/calendar');
const events = require('./routes/events');
const subscriptions = require('./routes/subscriptions');

const returnError = require('./utils/response/returnError');

const app = express();

if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/', calendar);
app.use('/', events);
app.use('/', subscriptions);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const error = new Error('Not Found');
    error.status = 404;
    error.title = 'Page Not Found';
    next(error);
});

// error handler
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    returnError(res, err.message, err.status, err.title);
});

module.exports = app;
