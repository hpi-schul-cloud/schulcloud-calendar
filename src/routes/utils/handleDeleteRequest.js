const handleSuccess = require('./returnSuccess');
const handleError = require('./returnError');
const deleteEvent = require('../../queries/deleteEvent');

function handleDeleteRequest(req, res) {
    // TODO implement with scopeIds
    var eventId = req.params.eventId;
    Promise.resolve(deleteEvent([eventId])).then(
        handleSuccess.bind(null, res, ''),
        handleError.bind(null, res)
    );
}
module.exports = handleDeleteRequest;
