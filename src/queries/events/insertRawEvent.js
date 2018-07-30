const client = require('../../infrastructure/database');
const errorMessage = require('../utils/errorMessage');
const {
    allColumns,
    insertColumns,
    insertTemplate
} = require('./constants');

function insertRawEvent(params,uid) {
    return new Promise(function (resolve, reject) {
        let query = `INSERT INTO events ${insertColumns} `
            + `VALUES ${insertTemplate} `
            + `RETURNING ${allColumns}`;

		if(uid!=undefined){
			params.unshift(uid);
			query=	query
					.replace('INTO events (','INTO events (id,')
					.replace(') RETURNING',', $'+params.length+') ON CONFLICT (id) DO NOTHING RETURNING');
		}
        client.query(query, params, function (error, result) {
            if (error) {
                errorMessage('query',query,error);
                reject(error);
            } else {
				//ON CONFLICT .. DO NOTHING  do not return anything by conflict
				//to get a valid result in this case it pass null 
				if(uid!=undefined && result.rows[0]==undefined) 
					resolve(null);
                else 
					resolve(result.rows[0]);
            }
        });
    });
}

module.exports = insertRawEvent;
