function queryToIcs(events, scope) {
    let ics = 'BEGIN:VCALENDAR\n';
    ics += 'VERSION:2.0\n';
    ics += 'PRODID:https://schulcloud.org:3000/calendar/test/\n';

    const name = scope && scope.attributes.name;
    if (name) {
        ics += `X-WR-CALNAME:${name}\n`;
    }

    if (events.length === 0) {
        // TODO: Handle empty calendar
        return '';
    }

    events.map(function (event) {
        ics += event;
    });

    return ics += 'END:VCALENDAR\n';
}

module.exports = queryToIcs;
