const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const cors = require('cors');
const config = require('../config');
const corsOptions = {
    origin: config.CORS_ORIGIN
};
router.use(cors(corsOptions));
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// authentication, authorization and preprocessing
const { authenticateFromHeaderField } = require('../security/authentication');
const { authorizeAccessToScopeId, authorizeAccessToObjects } = require('../security/authorization');
const jsonApiToJson = require('../parsers/subscription/jsonApiToJson');

// response
const returnError = require('../utils/response/returnError');
const returnSuccess = require('../utils/response/returnSuccess');
const sendNotification = require('../services/sendNotification');
const subscriptionsToJsonApi = require('../parsers/subscription/subscriptionsToJsonApi');

// content
const getSubscriptions = require('../services/subscriptions/getSubscriptions');
const storeSubscriptions = require('../services/subscriptions/storeSubscriptions');
const updateSubscription = require('../queries/subscriptions/updateSubscription');
const deleteSubscription = require('../queries/subscriptions/deleteSubscription');

/* routes */

router.get('/subscriptions', authenticateFromHeaderField, function (req, res) {
    const scopeId = req.query['scope-id'];
    const subscriptionId = req.query['subscription-id'];
    const lastUpdateFailed = req.query['last-update-failed'];
    const filter = { scopeId, subscriptionId, lastUpdateFailed };
    const user = req.user;
    const token = req.get('Authorization');

    authorizeAccessToScopeId(user, filter.scopeId)
        .then(() => getSubscriptions(filter, token))
        .then((subscriptions) => authorizeAccessToObjects(user, 'can-read', subscriptions))
        .then(subscriptionsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

router.post('/subscriptions', jsonApiToJson, authenticateFromHeaderField, function (req, res) {
    const user = req.user;
    const subscriptions = req.subscriptions;

    authorizeAccessToObjects(user, 'can-write', subscriptions)
        .then(storeSubscriptions)
        .then((insertedSubscriptions) => {
            insertedSubscriptions.forEach((insertedSubscription) => {
                sendNotification.forNewSubscription(
                    insertedSubscription['scope_id'],
                    insertedSubscription['description'],
                    insertedSubscription['ics_url']
                );
            });
            return insertedSubscriptions;
        })
        .then(subscriptionsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

router.put('/subscriptions/:subscriptionId', jsonApiToJson, authenticateFromHeaderField, function (req, res) {
    const subscription = req.subscriptions[0];
    const { ics_url, description } = subscription;
    const subscriptionId = req.params.subscriptionId;
    const filter = { subscriptionId: subscriptionId };
    const user = req.user;
    const token = req.get('Authorization');

    getSubscriptions(filter, token)
        .then((existingSubscriptions) => authorizeAccessToObjects(user, 'can-read', existingSubscriptions))
        .then((existingSubscriptions) => authorizeAccessToObjects(user, 'can-write', existingSubscriptions))
        .then(() => authorizeAccessToObjects(user, 'can-write', [subscription]))
        .then(() => updateSubscription([ics_url, description, subscriptionId]))
        .then((updatedSubscription) => {
            if (updatedSubscription) {
                sendNotification.forModifiedSubscription(
                    updatedSubscription['scope_id'],
                    updatedSubscription['description'],
                    updatedSubscription['ics_url']
                );
                return [updatedSubscription];
            } else {
                const error = 'Given subscriptionId not found';
                const status = 404;
                const title = 'Query Error';
                return Promise.reject({error, status, title});
            }
        })
        .then(subscriptionsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

router.delete('/subscriptions/:subscriptionId', authenticateFromHeaderField, function (req, res) {
    const subscriptionId = req.params.subscriptionId;
    const filter = { subscriptionId: subscriptionId };
    const user = req.user;
    const token = req.get('Authorization');

    getSubscriptions(filter, token)
        .then((existingSubscriptions) => authorizeAccessToObjects(user, 'can-write', existingSubscriptions))
        .then(() => deleteSubscription(subscriptionId))
        .then((deletedSubscription) => {
            if (deletedSubscription) {
                sendNotification.forDeletedSubscription(
                    deletedSubscription['scope_id'],
                    deletedSubscription['description'],
                    deletedSubscription['ics_url']
                );
                returnSuccess(res, 204);
            } else {
                const message = 'Given subscriptionId not found';
                const status = 404;
                const title = 'Query Error';
                returnError(res, message, status, title);
            }
        })
        .catch(({ message, status, title }) => {
            returnError(res, message, status, title);
        });
});

module.exports = router;
