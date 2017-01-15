function handleSuccess(res, results = '') {
    if (!res.headersSent)
        res.status(201).send("Success: " + JSON.stringify(results));
}

module.exports = handleSuccess;
