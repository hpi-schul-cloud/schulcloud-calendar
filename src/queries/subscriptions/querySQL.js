const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');

function querySQL(query,params) {
    return new Promise(function(resolve, reject) {
		console.log( query, params );
		client.query(query, params, function (error, result) {
            if (error) {
                errorMessage(query, error);
                reject(error);
            } else {
				if(result.rows.length<=0){
					console.error('No query target found!');
					errorMessage(query, error);
					reject(error)
				}		
				else						
					resolve(result.rows);
            }
        });
		
	})
}

module.exports = querySQL;