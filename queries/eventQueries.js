var client = require('../models/database');

module.exports = {
    getAll: function() {
        return new Promise(function(resolve, reject) {
            client.query('SELECT * FROM events ORDER BY id ASC;', function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    },
    insert: function(params) {
        return new Promise(function(resolve, reject) {
            //TODO: check if SQL injection prevention works properly
            const query = 'INSERT INTO events (summary, location, description, start_timestamp, end_timestamp, reference_id, created_timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)';
            client.query(query, params, function (error, result) {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
};
