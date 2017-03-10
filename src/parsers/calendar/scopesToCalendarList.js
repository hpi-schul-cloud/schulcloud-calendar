const config = require('./../config');

function formatCalendarList(scopes) {
    return {
        links: {
            self: `${config.ROOT_URL}/calendar/list`
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
            'ics-url': `${config.ROOT_URL}/calendar/${scope.id}`
        }
    };
}

module.exports = formatCalendarList;
