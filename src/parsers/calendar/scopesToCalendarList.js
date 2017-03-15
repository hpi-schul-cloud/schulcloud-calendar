const config = require('../../config');

function scopesToCalendarList(scopes, token) {
    return {
        links: {
            self: `${config.ROOT_URL}/calendar/list`
        },
        data: scopes.map((scope) => scopeToJsonApi(scope, token))
    };
}

function scopeToJsonApi(scope, token) {
    return {
        type: 'ics-feed-per-scope',
        id: scope.id,
        attributes: {
            name: scope.name,
            'ics-url': `${config.ROOT_URL}/calendar`
                + `?authorization=${token}`
                + `&scope-id=${scope.id}`
        }
    };
}

module.exports = scopesToCalendarList;
