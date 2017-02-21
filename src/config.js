/**
 * Global Settings fot the Schul-Cloud Calendar Service
 */

/**
 * Notification Settings
 */

exports.NOTIFICATION_SERVICE_TOKEN = 'service1';
exports.NOTIFICATION_SCHULCLOUD_ID = '1';

/**
 * Base Paths
 */
const SCHULCLOUD_BASE_PATH = 'https://schulcloud-api-mock.herokuapp.com';
const NOTIFICATION_SERVICE_BASE_PATH = 'https://schul-cloud.org:3030';

/**
 * API Paths
 */
exports.SCHULCLOUD_ALL_USERS_FOR_UUID = SCHULCLOUD_BASE_PATH + '/api/all_users/';
exports.SCHULCLOUD_ALL_SCOPES_FOR_TOKEN = SCHULCLOUD_BASE_PATH + '/api/all_scopes/';
exports.NOTIFICATION_SERVICE_NEW_NOTIFICATION = NOTIFICATION_SERVICE_BASE_PATH + '/messages';

/**
 * CORS
 */
exports.CORS_ORIGIN = 'https://schulcloud.github.io';

/**
 * Logging
 */
exports.LOG_LEVEL = 'debug';