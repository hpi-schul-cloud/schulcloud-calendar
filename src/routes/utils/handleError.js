function handleError(res, error, statusCode) {
    if (error)
        console.error(error);
    if (res && !res.headersSent)
        if (statusCode && error) {
            res.status(statusCode).send(error);
        } else {
            res.status(500).send("Internal Server Error");
        }
    else
        console.error("res unavailable or headers already sent");
}

module.exports = handleError;
