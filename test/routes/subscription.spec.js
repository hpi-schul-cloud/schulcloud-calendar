const request = require('supertest');
const app = require('../../src/app');
const dbClient = require('../../src/infrastructure/database');
const DatabaseCleaner = require('database-cleaner');
const databaseCleaner = new DatabaseCleaner('postgresql');

describe('routes/subscription', function() {

    afterEach(function(done) {
        databaseCleaner.clean(dbClient, done);
    });

    describe('POST', function() {

        it('subscribes to a feed with one scopeId', function(done) {
            this.timeout(10000);
            request(app)
                .post('/subscriptions')
                .set('Authorization', 'teacher1_1')
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
                'scope-ids': ['d46b16ce-6d98-44b7-bcbc-a36c50098144']
            }
        }
    ]
};
