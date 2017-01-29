function returnSuccessWithoutContent(res) {
    if (res && !res.headersSent)
        res.status(204).send();
    else
        console.error("res unavailable or headers already sent");
}

module.exports = returnSuccessWithoutContent;
