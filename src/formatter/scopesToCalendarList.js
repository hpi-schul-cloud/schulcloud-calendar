function formatCalendarList(scopes) {
    return {
        links: {
            self: 'https://schul-cloud.org:3000/calendar/list'
        },
        data: scopes.map(scopeToJsonApi)
    };
}

function scopeToJsonApi(scope) {
    return {
        type: 'ics-feed-per-scope',
        id: scope.id,
        attributes: {
            name: scope.name,
            'ics-url': `https://schul-cloud.org:3000/calendar/${scope.id}`
        }
    };
}

module.exports = formatCalendarList;
