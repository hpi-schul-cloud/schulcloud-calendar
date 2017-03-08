function jsonApiToJson(req, res, next) {
    const subscriptions = req.body.data.map((subscription) => {
        return {
            icsUrl: subscription.attributes['ics-url'],
            description: subscription.attributes['description'],
            separateUsers: subscription.relationships['separate-users'],
            scopeIds: subscription.relationships['scope-ids']
        };
    });
    req.subscriptions = subscriptions;
    next();
}

module.exports = jsonApiToJson;
