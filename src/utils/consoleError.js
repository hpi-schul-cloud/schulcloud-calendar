// Doing this because we don't want to have console.errors in unit tests.
// Just disabling it inside the test by overwriting and later reassigning
// console.error does not work with the coverage report.

function consoleError(message) {
    if (process.env.NODE_ENV !== 'test') {
        console.error(message);
    }
}

module.exports = consoleError;
