const returnSuccess = require('./returnSuccess');
const returnError = require('./returnError');
const deleteEvent = require('../../queries/deleteEvent');

function handleDeleteRequest(req, res) {
    // TODO implement with scopeIds
    let eventId = req.params.eventId;
    Promise.resolve(deleteEvent([eventId])).then(
        returnSuccess.bind(null, res, ''),
        returnError.bind(null, res)
    );
}
module.exports = handleDeleteRequest;
