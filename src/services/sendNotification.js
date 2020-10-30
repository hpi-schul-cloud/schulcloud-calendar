const sendNotification = require('../http/sendNotification');
const logger = require('../infrastructure/logger');

function _sendNotification(title, body, scopeIds) {
    if (!(scopeIds instanceof Array)) {
        scopeIds = [scopeIds];
    }
    sendNotification(title, body, scopeIds)
        .catch((error) => {
            logger.warning(`[SendNotification] ${error.name} (${error.code}): ${error.message}`);
        });
}

function forNewEvent(scopeId, summary, start, end) {
    const title = `Neuer Termin "${summary}" erstellt`;
    const body =
        `Es wurde ein neuer Termin für Sie erstellt!
        ${summary} von ${start} bis ${end}`;
    _sendNotification(title, body, scopeId);
}

function forModifiedEvent(scopeId, summary, start, end) {
    const title = `Der Termin "${summary}" wurde verändert`;
    const body =
        `Ein Termin wurde verändert!
        ${summary} von ${start} bis ${end}`;
    _sendNotification(title, body, scopeId);
}

function forDeletedEvent(scopeId, summary, start, end) {
    const title = `Der Termin "${summary}" wurde gelöscht`;
    const body =
        `Ein Termin wurde gelöscht!
        ${summary} von ${start} bis ${end}`;
    _sendNotification(title, body, scopeId);
}

function forNewSubscription(scopeId, description, icsUrl) {
    const title = `Neuer Feed "${description}" abonniert`;
    const body =
        `Es wurde ein neuer Feed für Sie abonniert!
        ${description}, ${icsUrl}`;
    _sendNotification(title, body, scopeId);
}

function forModifiedSubscription(scopeId, description, icsUrl) {
    const title = `Das Abonnement des Feeds "${description}" wurde verändert`;
    const body =
        `Das Abonnement eines Feeds wurde verändert!
        ${description}, ${icsUrl}`;
    _sendNotification(title, body, scopeId);
}

function forDeletedSubscription(scopeId, description, icsUrl) {
    const title = `Das Abonnement des Feeds "${description}" wurde gelöscht`;
    const body =
        `Das Abonnement eines Feeds wurde gelöscht!
        ${description}, ${icsUrl}`;
    _sendNotification(title, body, scopeId);
}

module.exports = {
    forNewEvent,
    forModifiedEvent,
    forDeletedEvent,
    forNewSubscription,
    forModifiedSubscription,
    forDeletedSubscription
};
