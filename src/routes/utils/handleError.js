const errorMessage = {
    "errors": [
        {
            "status": 500,
            "title": "Internal Server Error",
            "detail": ""
        }
    ]
};

function handleError(res, error, statusCode = 500, errorTitle = "Internal Server Error") {
    if (error) {
        errorMessage.errors[0].detail = error;
        errorMessage.errors[0].title = errorTitle;
        errorMessage.errors[0].status = statusCode;
        console.error(error);
    }
    if (res && !res.headersSent)
        res.contentType('application/json').status(statusCode).send(errorMessage);
    else
        console.error("res unavailable or headers already sent");
}

module.exports = handleError;
