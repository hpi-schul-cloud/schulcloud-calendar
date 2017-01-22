const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const dbClient = require('../../src/models/database');
const fillDatabase = require('../_testutils/fillDatabase');
const DatabaseCleaner = require('database-cleaner');
const databaseCleaner = new DatabaseCleaner('postgresql');

describe('routes/calendar', function() {

    beforeEach(function(done) {
        fillDatabase(dbClient, done);
    });

    afterEach(function(done) {
        databaseCleaner.clean(dbClient, done);
    });

    describe('GET calendar/test', function() {

        it('gets a calendar', function(done) {
            // needs to be set because we have to wait for promises
            this.timeout(10000);
            request(app)
                .get('/calendar/test')
                .set('Authorization', 'student1_1')
                .expect('Content-Disposition', /attachment/)
                .expect('Content-Type', 'text/calendar')
                .expect('Content-Length', '543')
                .expect(200, done);
        });

    });
});
