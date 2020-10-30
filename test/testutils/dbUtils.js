/* eslint-disable no-logger */
// initialize dummy events
const path = require('path');
const fs = require('fs');
const logger = require('../../src/infrastructure/logger');

const dropTablesPath = path.join(__dirname, '..', '..','dropTables.sql');
const dropTablesQueryString = clearSQL(fs.readFileSync(dropTablesPath).toString());
const dropTablesQuery = dropTablesQueryString.reduce(function(combined, query, index) {
	if (query.substring(0, 2) === '--') {   
		return combined;
	}
	return combined + query + semicolon(query, index, dropTablesQueryString);
}, '');

const schemaPath = path.join(__dirname, '..', '..','schema.sql');
const schemaQueryString = clearSQL(fs.readFileSync(schemaPath).toString());
const schemaQuery = schemaQueryString.reduce(function(combined, query, index) {
	if (query.substring(0, 2) === '--') {   
		return combined;
	}
	return combined + query + semicolon(query, index, schemaQueryString);
}, '');

const exampleDataPath = path.join(__dirname, '..', '..','example_data.sql');
const exampleDataQueryString = clearSQL(fs.readFileSync(exampleDataPath).toString());
const exampleDataQuery = exampleDataQueryString.reduce(function(combined, query, index) {
	if (query.substring(0, 2) === '--') {   
		return combined;
	}
	return combined + query + semicolon(query, index, exampleDataQueryString);
}, '');

function semicolon(query, index, base) {
	const nextQuery = query[index + 1];
	const isLastQuery = index === base.length - 1;
	if ( isLastQuery || nextQuery.indexOf('VALUE=') === 0) {
		return ';';
	} else {
		return '; ';
	}
}

function clearSQL(str) {
	return str.replace(/(\r\n|\n|\r)/gm, ' ') // remove newlines
	.replace(/\s+/g, ' ') // excess white space
	.split(';') // split into all statements
	.map(Function.prototype.call, String.prototype.trim)
	.filter(function(el) {return el.length != 0;}); // remove any empty ones
}

const fillDatabase = (client) => (done) => {
	logger.debug('execute fillDatabase >');
	return client.query(exampleDataQuery)
		.then((result) => {
			if(done) {done();}
		}).catch((err) => {
			logger.error(new Error(err));
		});
};

const clearData = (client) => (done) =>  {
	logger.debug('execute clearData >');
	return client.query(dropTablesQuery)
		.then((result) =>{
			if (done){ done(); }
		})
		.catch((err) => {
			logger.error(new Error(err));
		});
};

const setSchema = (client) => (done) =>  {
	logger.debug('execute setSchema >');
	return client.query(schemaQuery)
		.then((result) => {
			if(done) {done();}  
		})
		.catch((err) => {
			logger.error(new Error(err));
   		 });
};

const resetDB = (client) => (done) => {
	return clearData(client)().then(() => {
		return fillDatabase(client)().then(() => {
			if(done) {done();}  
		});
	});
};

module.exports = (client) => ({
	fillDatabase: fillDatabase(client),
	clearData: clearData(client),
	setSchema: setSchema(client),
	resetDB: resetDB(client),
});
