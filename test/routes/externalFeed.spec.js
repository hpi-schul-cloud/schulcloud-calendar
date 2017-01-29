const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const dbClient = require('../../src/models/database');
const DatabaseCleaner = require('database-cleaner');
const databaseCleaner = new DatabaseCleaner('postgresql');

describe('routes/external-feed-subscription', function() {

    afterEach(function(done) {
        databaseCleaner.clean(dbClient, done);
    });

    describe('POST', function() {

        it('subscribes to a feed with one scopeId', function(done) {
            this.timeout(10000);
            request(app)
                .post('/external-feed-subscription')
                .set('Authorization', 'student1_1')
                .send(withSingleScopeId)
                .expect(200, done);
        });

    });
});

const withSingleScopeId = {
    'data': [
        {
            'type': 'external-feed',
            'attributes': {
                'ics-url': 'https://calendars.icloud.com/holidays/de_de.ics',
                'description': 'Public Holidays in Germany'
            },
            'relationships': {
                'separate-users': true,
                'scope-ids': ['663ad332-3cd6-4e75-90bd-a2dfd9132f84']
            }
        }
    ]
};
