/**
 * @author Niklas Hoffmann
 */

const SCHULCLOUD_BASE_PATH = "https://schulcloud-api-mock.herokuapp.com";
const NOTIFICATION_SERVICE_BASE_PATH = "https://schul-cloud.org:3030";
exports.SCHULCLOUD_ALL_USERS_FOR_UUID = SCHULCLOUD_BASE_PATH + "/api/all_users/";
exports.SCHULCLOUD_ALL_SCOPES_FOR_TOKEN = SCHULCLOUD_BASE_PATH + "/api/all_scopes/";
exports.NOTIFICATION_SERVICE_NEW_NOTIFICATION = NOTIFICATION_SERVICE_BASE_PATH + "/messages";
