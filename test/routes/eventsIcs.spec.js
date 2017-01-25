const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const dbClient = require('../../src/models/database');
const fillDatabase = require('../_testutils/fillDatabase');
const DatabaseCleaner = require('database-cleaner');
const databaseCleaner = new DatabaseCleaner('postgresql');

describe('routes/events/ics', function() {

    beforeEach(function(done) {
        fillDatabase(dbClient, done);
    });

    afterEach(function(done) {
        databaseCleaner.clean(dbClient, done);
    });

    describe('POST', function() {

        it('handles invalid ids', function(done) {
            request(app)
                .post('/events/ics')
                .set('Authorization', 'student1_1')
                .send({ ids: 'not an array' })
                .expect(500, done);
        });

        it('handles an invalid ics');

        it('creates events');

    });
});
