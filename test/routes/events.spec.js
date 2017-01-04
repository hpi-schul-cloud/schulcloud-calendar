const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const dbClient = require('../../src/models/database');
const fillDatabase = require('../_testutils/fillDatabase');
const DatabaseCleaner = require('database-cleaner');
const databaseCleaner = new DatabaseCleaner('postgresql');

describe('routes/events', function() {

    var error;

    beforeEach(function(done) {
        // suppress console.errors
        console.error = function() {};
        fillDatabase(dbClient, done);
    });

    afterEach(function(done) {
        console.error = error;
        databaseCleaner.clean(dbClient, done);
    });

    describe('POST', function() {

        it('handles invalid ids', function(done) {
            request(app)
                .post('/events')
                .send({ ids: 'not an array' })
                .expect(500, done);
        });

        it('handles an invalid ics');

        it('creates events');

    });
});
