const expect = require('chai').expect;
const nock = require('nock');
const request = require('supertest');

const app = require('../../src/app');
const { SERVER_SCOPES_URI, SCHULCLOUD_BASE_PATH } = require('../../src/config');
const dbClient = require('../../src/infrastructure/database');
const {
    dbUtils,
    serverMockData: { createOverlayWithDefaultScopes, addCourseScope },
    convertEventToJsonApi,
} = require('../_testutils/');

const { resetDB, clearData } = dbUtils(dbClient);

// const databaseCleaner = new DatabaseCleaner('postgresql');
const resolvedServerScopes = createOverlayWithDefaultScopes();

describe('routes/events', function() {
    const userId = '59898b4a26ffc20c510cfcf0';

    beforeEach(function(done) {
        nock(SCHULCLOUD_BASE_PATH)
            .get(uri => uri.includes(SERVER_SCOPES_URI))
            .reply(200, () => {
                return resolvedServerScopes;
            });
        done();
    });

    before((done) => {
        resetDB(done);
    });

    after((done) => {
        clearData(done);
    });

    describe('events', () => {
        describe('POST', () => {
            const scopeId = '59cce16281297026d02cde123';
            const courseName = 'post test';
            before((done) => {
                addCourseScope(resolvedServerScopes, scopeId, courseName, true);
                done();
            });

            after((done) => {
                resolvedServerScopes.data = resolvedServerScopes.data.filter(scope => scope.id !== scopeId);
                done();
            }); 

            it('create event', (done) => {
                const eventData = convertEventToJsonApi({
                    courseId: scopeId,
                    scopeId,
                    summary: courseName,
                });

                request(app)
                    .post('/events')
                    .send(eventData)
                    .set('Authorization', userId)
                    .then((res) => {
                        const { data } = res.body;

                        expect(data).to.be.an('array').to.have.lengthOf(1);

                        const relationships = data[0].relationships['scope-ids'];

                        expect(relationships).to.be.an('array').to.have.lengthOf(1);
                        expect(relationships[0]).to.be.equal(scopeId);

                        expect(data[0].attributes.summary).to.be.equal(courseName);

                        done();
                    });
            });
        });
    
        describe('GET', () => {
            it('get all for this user', (done) => {
                request(app)
                    .get('/events')
                    .query({
                        all: true,
                    })
                    .set('Authorization', userId)
                    .then((res) => {
                        expect(res.body.data).to.be.an('array').to.have.lengthOf(5);
                        done();
                    });
            });
    
            it('get one specific event by scope-id for this user', (done) => {
                request(app)
                    .get('/events')
                    .query({
                        'scope-id': '5db838ff8517be0028847d1d',
                    })
                    .set('Authorization', userId)
                    .then((res) => {
                        expect(res.body.data).to.be.an('array').to.have.lengthOf(1);
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

    describe('isc', () => {
        describe('CREATE', () => {

        });
    });
});
