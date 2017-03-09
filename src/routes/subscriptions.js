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

// content
const getSubscriptions = require('../services/getSubscriptions');
const storeSubscriptions = require('../services/storeSubscriptions');
const updateSubscription = require('../services/updateSubscription');
const deleteSubscription = require('../queries/deleteSubscription');

/* routes */

router.get('/subscriptions', authorize, function (req, res) {
    const token = req.get('Authorization');
    const scopeId = req.get('scope-id');
    const subscriptionId = req.get('subscription-id');
    const lastUpdateFailed = req.get('last-update-failed');
    const filter = { scopeId, subscriptionId, lastUpdateFailed };
    getSubscriptions(filter, token)
        .then((subscriptions) => { returnSuccess(res, 200, subscriptions); })
        .catch((error) => { returnError(res, error); });
});

router.post('/subscriptions', authorize, jsonApiToJson, function (req, res) {
    const { subscriptions } = req;
    storeSubscriptions(subscriptions)
        .then((insertedSubscriptions) => {
            insertedSubscriptions.forEach((insertedSubscription) => {
                sendNotification.forNewSubscription(
                    insertedSubscription['reference_id'],
                    insertedSubscription['description'],
                    insertedSubscription['ics_url']
                );
            });
            returnSuccess(res, 200, insertedSubscriptions);
        })
        .catch((error) => returnError(error));
});

router.put('/subscriptions/:subscriptionId', authorize, jsonApiToJson, function (req, res) {
    const subscriptionId = req.params.subscriptionId;
    const subscriptions = req.subscriptions;
    updateSubscription(subscriptions, subscriptionId)
        .then((updatedSubscription) => {
            sendNotification.forModifiedSubscription(
                updatedSubscription['reference_id'],
                updatedSubscription['description'],
                updatedSubscription['ics_url']
            );
            returnSuccess(res, 204);
        })
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
                    deletedSubscription['reference_id'],
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
        .catch((error) => { returnError(res, error); });
});

module.exports = router;
