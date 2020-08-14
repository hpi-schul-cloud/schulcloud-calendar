const expect = require('chai').expect;
const nock = require('nock');
const request = require('supertest');

const app = require('../../src/app');
const { SERVER_SCOPES_URI, SCHULCLOUD_BASE_PATH } = require('../../src/config');
const getClient = require('../../src/infrastructure/database');
const {
    dbUtils,
    serverMockData: { createOverlayWithDefaultScopes, addCourseScope },
    convertEventToJsonApi,
} = require('../_testutils/');

// const databaseCleaner = new DatabaseCleaner('postgresql');
const resolvedServerScopes = createOverlayWithDefaultScopes();

/** helpers */
const getDate = (minOffset) => new Date(new Date().getTime() + (minOffset * 1000 * 60)).toISOString();

const addTestEvents = ({scopeId = '59cce16281297026d02cde123',  userId = '59898b4a26ffc20c510cfcf0', courseName = 'test'}, optionalData = {}) => {
        const needed = {
            courseId: scopeId,
            scopeId,
            summary: courseName,
        };
        const eventData = convertEventToJsonApi({ ...needed, ...optionalData });

        return request(app)
            .post('/events')
            .send(eventData)
            .set('Authorization', userId)
            .then((res) => {
                if (res.body.errors) {
                    if (res.body.errors[0]) {
                        console.log(res.body.errors[0]);
                    } else {
                        console.log(res.body.errors);
                    }
                    return
                }
                return res.body.data[0]
            })
            .catch((err) => {
                console.log('Can not insert test event', err);
            });
}

/** tests */
describe('routes/events', function() {
    const userId = '59898b4a26ffc20c510cfcf0';
    let resetDB;
    let clearData;

    beforeEach((done) => {
        nock(SCHULCLOUD_BASE_PATH)
            .get(uri => uri.includes(SERVER_SCOPES_URI))
            .reply(200, () => {
                return resolvedServerScopes;
            });
        done();
    });

    before((done) => {
		getClient(true).then((client) => {
			({ resetDB, clearData } = dbUtils(client));
			resetDB(done);
		});    
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
            const scopeId = '59cce16281297026d02abc123';
            const courseName = 'find time box test';
            let events;
            before((done) => {
                addCourseScope(resolvedServerScopes, scopeId, courseName, true);
                
                Promise.all([
                    addTestEvents({ scopeId }, { startDate: getDate(-30), endDate: getDate(30)}), // touched start
                    addTestEvents({ scopeId }, { startDate: getDate(15), endDate: getDate(45)}), // in time
                    addTestEvents({ scopeId }, { startDate: getDate(30), endDate: getDate(90)}), // touched end
                    addTestEvents({ scopeId }, { startDate: getDate(-30), endDate: getDate(90)}), // start before and end after
                    addTestEvents({ scopeId }, { startDate: getDate(-60), endDate: getDate(-30)}), // end before - should not found
                    addTestEvents({ scopeId }, { startDate: getDate(90), endDate: getDate(120)}),// start after - should not found
                    addTestEvents({ scopeId: '59cce16281297026d02xyz999' }, { startDate: getDate(15), endDate: getDate(45)}), // other scope - should not found
                ]).then((e) => {
                    events = e;
                    done();
                }).catch((err) => {
                    console.log('Can not insert test events.', err)
                });
            });

            after((done) => {
                resolvedServerScopes.data = resolvedServerScopes.data.filter(scope => scope.id !== scopeId);
                done();
            }); 

            it('find all events that touched by requested time box', (done) => {
                request(app)
                    .get('/events')
                    .query({
                        all: true,
                    })
                    .set('Authorization', userId)
                    .then((res) => {
                        expect(res.body.data).to.be.an('array').to.have.lengthOf(5);
                        done();
                    }).catch((err) => {
                        console.log(err);
                        done();
                    });
            });
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
