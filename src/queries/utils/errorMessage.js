function errorMessage(query, error) {
    console.error("Error processing " + query);
    console.error(error);
}

module.exports = errorMessage;
