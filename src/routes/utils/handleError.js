function handleError(res) {
    if (!res.headersSent)
        res.status(500).send("Internal Server Error");
}

module.exports = handleError;
