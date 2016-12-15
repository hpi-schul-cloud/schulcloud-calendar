function handleSuccess(res) {
    if (!res.headersSent)
        res.status(201).send("Success");
}

module.exports = handleSuccess;
