const pg = require('pg');
const express = require("express");
const app = express();
const types = require('pg').types;
const INTERVAL_OID = 1186;

let db;
if (app.get('env') === 'production') {
    const db_username = process.env.DB_USERNAME;
    const db_password = process.env.DB_PASSWORD;
    const db_host = process.env.DB_HOST;
    const db_port = process.env.DB_PORT || 5432;
    const db_database = process.env.DB_DATABASE;

    if (!db_username || !db_password || !db_host || !db_port || !db_database) {
        throw new Error('expected database credentials but incomplete specified');
    }

    db = `postgres://${db_username}:${db_password}@${db_host}:${db_port}/${db_database}`;
} else if (app.get('env') === 'test') {
    db = 'postgres://node:node@localhost:5432/schulcloud_calendar_test';
} else {
    db = 'postgres://node:node@localhost:5432/schulcloud_calendar';
}

const client = new pg.Client(db);
client.connect();

client.query("SET intervalstyle = 'iso_8601';");

types.setTypeParser(INTERVAL_OID, function(val) {
    return val.toString();
});

module.exports = client;
