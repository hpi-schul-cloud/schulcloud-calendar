const request = require('supertest');
const app = require('../../src/app');
const nock = require('nock');
const dbClient = require('../../src/infrastructure/database');

describe.skip('routes/subscription', function() {

    beforeEach(function() {
        // mock API Calls
        nock('http://localhost:3030')
        .get('/api/all_scopes/teacher1_1')
        .reply(200, '');
    });

    afterEach(function(done) {
		// databaseCleaner.clean(dbClient, done);
        done();
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
