const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes');
const eventsIcs = require('./routes/eventsIcs');
const events = require('./routes/events');
const externalFeed = require('./routes/externalFeed');
const returnError = require('./routes/utils/returnError');

const app = express();

if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/events/ics', eventsIcs);
app.use('/events', events);
app.use('/external-feed-subscription', externalFeed);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) { // eslint-disable-line no-unused-vars
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    returnError(res, err.message, err.status);
});

module.exports = app;
