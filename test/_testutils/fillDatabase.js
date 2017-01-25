// initialize dummy events

const fs = require('fs');
const queries = fs.readFileSync('example_data.sql').toString()
    .replace(/(\r\n|\n|\r)/gm, ' ') // remove newlines
    .replace(/\s+/g, ' ') // excess white space
    .split(";") // split into all statements
    .map(Function.prototype.call, String.prototype.trim)
    .filter(function(el) {return el.length != 0}); // remove any empty ones

const sql = queries.reduce(function(combined, query, index) {
    return combined + query + semicolon(query, index);
}, '');

function semicolon(query, index) {
    const nextQuery = queries[index + 1];
    const isLastQuery = index === queries.length - 1;
    if ( isLastQuery || nextQuery.indexOf('VALUE=') === 0) {
        return ';'
    } else {
        return '; '
    }
}

function fillDatabase(client, done) {

    client.query(sql, function() {
        done();
    });
}

module.exports = fillDatabase;
