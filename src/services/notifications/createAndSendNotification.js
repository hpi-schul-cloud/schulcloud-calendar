
const newNotificationForScopeIds = require('../../http-requests/newNotificationForScopeIds');

function forNewEvent(scopeIds, summary, start, end) {
    const title = "Neuer Termin \"" + summary + "\" erstellt";
    const body = "Es wurde ein neuer Termin für Sie erstellt!\n" + summary + " von " + start + " bis " + end;
    newNotificationForScopeIds(title, body, scopeIds);
}

function forModifiedEvent(scopeIds, summary, start, end) {
    const title = "Der Termin \"" + summary + "\" wurde verändert";
    const body = "Ein Termin wurde verändert!\n" + summary + " von " + start + " bis " + end;
    newNotificationForScopeIds(title, body, scopeIds);
}

function forDeletedEvent(scopeIds, summary, start, end) {
    const title = "Der Termin \"" + summary + "\" wurde gelöscht";
    const body = "Ein Termin wurde gelöscht!\n" + summary + " von " + start + " bis " + end;
    newNotificationForScopeIds(title, body, scopeIds);
}

module.exports = {
    forNewEvent: forNewEvent,
    forModifiedEvent: forModifiedEvent,
    forDeletedEvent: forDeletedEvent
};
