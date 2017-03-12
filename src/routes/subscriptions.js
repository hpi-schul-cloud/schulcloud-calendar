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

// preprocessing
const authorize = require('../infrastructure/authorization');
const jsonApiToJson = require('../parsers/subscription/jsonApiToJson');

// response
const returnError = require('../utils/response/returnError');
const returnSuccess = require('../utils/response/returnSuccess');
const sendNotification = require('../services/sendNotification');
const subscriptionsToJsonApi = require('../parsers/subscription/subscriptionsToJsonApi');

// content
const getSubscriptions = require('../services/subscriptions/getSubscriptions');
const storeSubscriptions = require('../services/subscriptions/storeSubscriptions');
const updateSubscription = require('../services/subscriptions/updateSubscription');
const deleteSubscription = require('../queries/deleteSubscription');

/* routes */

router.get('/subscriptions', authorize, function (req, res) {
    const token = req.get('Authorization');
    const scopeId = req.query['scope-id'];
    const subscriptionId = req.query['subscription-id'];
    const lastUpdateFailed = req.query['last-update-failed'];
    const filter = { scopeId, subscriptionId, lastUpdateFailed };
    getSubscriptions(filter, token)
        .then(subscriptionsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({error, status, title}) => {
            returnError(res, error, status, title);
        });
});

router.post('/subscriptions', jsonApiToJson, authorize, function (req, res) {
    const { subscriptions } = req;
    storeSubscriptions(subscriptions)
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
        .catch(({error, status, title}) => {
            returnError(res, error, status, title);
        });
});

router.put('/subscriptions/:subscriptionId', jsonApiToJson, authorize, function (req, res) {
    const subscriptionId = req.params.subscriptionId;
    const subscriptions = req.subscriptions;
    updateSubscription(subscriptions, subscriptionId)
        .then((updatedSubscription) => {
            sendNotification.forModifiedSubscription(
                updatedSubscription['scope_id'],
                updatedSubscription['description'],
                updatedSubscription['ics_url']
            );
            return [updatedSubscription];
        })
        .then(subscriptionsToJsonApi)
        .then((jsonApi) => { returnSuccess(res, 200, jsonApi); })
        .catch(({error, status, title}) => {
            returnError(res, error, status, title);
        });
});

router.delete('/subscriptions/:subscriptionId', authorize, function (req, res) {
    const subscriptionId = req.params.subscriptionId;
    deleteSubscription(subscriptionId)
        .then((deletedSubscription) => {
            if (deletedSubscription) {
                sendNotification.forDeletedSubscription(
                    deletedSubscription['scope_id'],
                    deletedSubscription['description'],
                    deletedSubscription['ics_url']
                );
                returnSuccess(res, 204);
            } else {
                const error = 'Given subscriptionId not found';
                const status = 404;
                const title = 'Query Error';
                returnError(res, error, status, title);
            }
        })
        .catch(({error, status, title}) => {
            returnError(res, error, status, title);
        });
});

module.exports = router;
