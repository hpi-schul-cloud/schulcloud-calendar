/**
 * Global Settings fot the Schul-Cloud Calendar Service
 */

/**
 * Database settings for production environment
 */

// START switch comment blocks to switch local development
exports.DB_HOST = process.env.DB_HOST;
exports.DB_DATABASE = process.env.DB_DATABASE;
exports.DB_USERNAME = process.env.DB_USERNAME;
exports.DB_PASSWORD = process.env.DB_PASSWORD;
// use following lines for local development
/*exports.DB_HOST = 'localhost';
exports.DB_USERNAME = 'node';
exports.DB_DATABASE = 'schulcloud_calendar';
exports.DB_PASSWORD = 'node';*/
// END switch to local environment

exports.DB_PORT = process.env.DB_PORT || 5432;
exports.API_KEY = process.env.API_KEY || 'example';

/**
 * Base Paths
 */
const SCHULCLOUD_BASE_PATH = process.env.SCHULCLOUD_BASE_PATH || 'https://schulcloud-api-mock.herokuapp.com';
const NOTIFICATION_SERVICE_BASE_PATH = process.env.NOTIFICATION_SERVICE_BASE_PATH || 'https://schul-cloud.org:3030';
exports.DOMAIN_NAME = process.env.DOMAIN_NAME || 'schul-cloud.org';
exports.ROOT_URL = process.env.ROOT_URL || `https://${exports.DOMAIN_NAME}:3000`;

/**
* API Paths
*/
// START switch comment blocks to switch local development
exports.SCHULCLOUD_ALL_USERS_FOR_UUID = process.env.SCHULCLOUD_ALL_USERS_FOR_UUID || SCHULCLOUD_BASE_PATH + '/api/all_users/';
exports.SCHULCLOUD_ALL_SCOPES_FOR_TOKEN = process.env. SCHULCLOUD_ALL_SCOPES_FOR_TOKEN || SCHULCLOUD_BASE_PATH + '/api/all_scopes/';
// use following lines for local development
/*exports.SCHULCLOUD_ALL_USERS_FOR_UUID = process.env.SCHULCLOUD_ALL_USERS_FOR_UUID || 'http://localhost:3030/resolve/users/';
exports.SCHULCLOUD_ALL_SCOPES_FOR_TOKEN = process.env. SCHULCLOUD_ALL_SCOPES_FOR_TOKEN || 'http://localhost:3030/resolve/scopes/';*/
// END switch to local environment

exports.NOTIFICATION_SERVICE_NEW_NOTIFICATION = process.env.NOTIFICATION_SERVICE_NEW_NOTIFICATION || NOTIFICATION_SERVICE_BASE_PATH + '/messages';

/**
 * Notification Settings
 */
exports.NOTIFICATION_SERVICE_TOKEN = process.env.NOTIFICATION_SERVICE_TOKEN || 'service1';
exports.NOTIFICATION_SCHULCLOUD_ID = process.env.NOTIFICATION_SCHULCLOUD_ID || '1';

/**
 * CORS
 */
exports.CORS_ORIGIN = process.env.CORS_ORIGIN || 'https://schulcloud.github.io';

/**
 * Logging
 */
exports.LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
