function handleError(res, error) {
    if (error)
        console.error(error);
    if (res && !res.headersSent)
        res.status(500).send("Internal Server Error");
    else
        console.error("res unavailable or headers already sent");
}

module.exports = handleError;
