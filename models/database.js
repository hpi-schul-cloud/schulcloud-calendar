const pg = require('pg');
const db = 'postgres://node:node@localhost:5432/schulcloud_calendar';
const client = new pg.Client(db);
client.connect();

module.exports = client;
