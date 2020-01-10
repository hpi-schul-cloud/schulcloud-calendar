const expect = require('chai').expect;
const nock = require('nock');
// const DatabaseCleaner = require('database-cleaner');
const request = require('supertest');

const app = require('../../src/app');
const { SERVER_SCOPES_URI, SCHULCLOUD_BASE_PATH } = require('../../src/config');
const dbClient = require('../../src/infrastructure/database');
const { createOverlayWithDefaultScopes } = require('../_testutils/serverMockData');
const dbUtils = require('../_testutils/fillDatabase');
const { resetDB, clearData } = dbUtils(dbClient);

// const databaseCleaner = new DatabaseCleaner('postgresql');

describe('routes/events', function() {

    beforeEach(function(done) {
        nock(SCHULCLOUD_BASE_PATH)
            .get(uri => uri.includes(SERVER_SCOPES_URI))
            .reply(200, (uri) => {
                // eslint-disable-next-line no-console
                console.log('nock is request:', uri);
                return createOverlayWithDefaultScopes();
            });
 
        resetDB(done);
    });

    afterEach((done) => {
        clearData(done);
    });

    describe.skip('POST', () => {
        it('with permissions', (done) => {
            request(app)
                .post('/events')
                .send({name: 'john'})
               // .expect('Content-Disposition', /attachment/)
               // .expect('Content-Type', 'text/calendar')
               // .expect(hasCalendarEntry)
                .expect(200, done);
        });
    });

    describe('GET', () => {
        it('with permissions', (done) => {
            request(app)
                .get('/events')
                .query({
                    all: true,
                })
                .set('Authorization', '59898b4a26ffc20c510cfcf0')
                .then((res) => {
                    expect(res.body.data).to.be.an('array').to.have.lengthOf(5);
                    done();
                });
        });
    });

    describe('FIND', () => {

    });

    describe('DELETE', () => {

    });

    describe('PUT', () => {

    });
});
