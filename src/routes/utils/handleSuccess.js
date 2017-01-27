function handleSuccess(res, results = '') {
    if (res && !res.headersSent)
        res.status(200).send("Success: " + JSON.stringify(results));
    else
        console.error("res unavailable or headers already sent");
}

module.exports = handleSuccess;
