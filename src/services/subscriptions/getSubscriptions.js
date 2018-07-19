const flatten = require('../../utils/flatten');
const getSubscriptionsFromDb = require('../../queries/subscriptions/getSubscriptions');
const moveScopeIdToArray = require('../_moveScopeIdToArray');

function getSubscriptions(filter, scopes) {
    return new Promise(function (resolve, reject) {
        if (filter.scopeId || filter.subscriptionId) {
		//route is also used for feather get request to a single resource 
            getSubscriptionsFromDb(filter)
				.then(moveScopeIdToArray)	//added to pass the validateSubscriptionJson 
                .then(resolve)
                .catch(reject);
        } else {
			//route is used for find get request 
            subscriptionsPerScope(scopes, filter)
                .then((subscriptions) => { 
					resolve(flatten(subscriptions)); 
				})
                .catch(reject);
        }
    });
}

function subscriptionsPerScope(scopes, filter) {
    return new Promise((resolve, reject) => {
        Promise.all(Object.keys(scopes).map((scopeId) => {
            filter.scopeId = scopeId;
            return completeSubscriptions(filter);
        })).then(resolve).catch(reject);
    });
}

function completeSubscriptions(filter) {
    return new Promise((resolve, reject) => {
        getSubscriptionsFromDb(filter)
            .then(moveScopeIdToArray)
            .then(resolve)
            .catch(reject);
    });
}

module.exports = getSubscriptions;
