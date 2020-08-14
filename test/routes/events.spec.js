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

/** helpers */
const getDate = (minOffset) => new Date(new Date().getTime() + (minOffset * 1000 * 60)).toISOString();

/** tests */
describe('routes/events', () => {
    const userId = '59898b4a26ffc20c510cfcf0';
    let resetDB;
    let clearData;
    let server;
    const resolvedServerScopes = createOverlayWithDefaultScopes();

    const addTestEvents = async ({scopeId = '59cce16281297026d02cde123',  userId = '59898b4a26ffc20c510cfcf0', courseName = 'test'}, optionalData = {}) => {
        const needed = {
            courseId: scopeId,
            scopeId,
            summary: courseName,
        };
        const eventData = convertEventToJsonApi({ ...needed, ...optionalData });

        await nock(SCHULCLOUD_BASE_PATH)
            .get(uri => uri.includes(SERVER_SCOPES_URI))
            .reply(200, () => {
                return resolvedServerScopes;
            });
    
        const result = await request(app)
            .post('/events')
            .send(eventData)
            .set('Authorization', userId);

            console.log('Request:', result.body.data);

            return result.body.data;
    }

    beforeEach(async () => {
        await nock(SCHULCLOUD_BASE_PATH)
            .get(uri => uri.includes(SERVER_SCOPES_URI))
            .reply(200, () => {
                return resolvedServerScopes;
            });
    });

    before(async () => {
        const client = await getClient(true);
        ({ resetDB, clearData } = dbUtils(client));
        await resetDB();
        server = await app.listen(3001);
    });

    after(async () => {
        await clearData();
        await server.close();
    });

    describe('events', () => {
        describe('POST', () => {
            const scopeId = '59cce16281297026d02cde123';
            const courseName = 'post test';
            before(async () => {
                await addCourseScope(resolvedServerScopes, scopeId, courseName, true);
            });

            after(async () => {
                resolvedServerScopes.data = resolvedServerScopes.data.filter(scope => scope.id !== scopeId);
            }); 

            it('create event', async () => {
                const eventData = convertEventToJsonApi({
                    courseId: scopeId,
                    scopeId,
                    summary: courseName,
                });

               const result = await request(app)
                    .post('/events')
                    .send(eventData)
                    .set('Authorization', userId);
                
                const { data } = result.body;

                expect(data).to.be.an('array').to.have.lengthOf(1);

                const relationships = data[0].relationships['scope-ids'];

                expect(relationships).to.be.an('array').to.have.lengthOf(1);
                expect(relationships[0]).to.be.equal(scopeId);

                expect(data[0].attributes.summary).to.be.equal(courseName);
            });
        });
    
        describe('GET', () => {
            it('get all for this user', async () => {
               const result = await request(app)
                    .get('/events')
                    .query({
                        all: true,
                    })
                    .set('Authorization', userId);

                expect(result.body.data).to.be.an('array').to.have.lengthOf(5);
            });
    
            it('get one specific event by scope-id for this user', async () => {
                const result = await request(app)
                    .get('/events')
                    .query({
                        'scopeId': '5db838ff8517be0028847d1d',
                    })
                    .set('Authorization', userId)

                expect(result.body.data).to.be.an('array').to.have.lengthOf(1);
            });
        });
    
        describe('FIND', () => {
            const scopeId = '59cce16281297026d02abc123';
            const courseName = 'find time box test';
            let events;
            before(async () => {
                await addCourseScope(resolvedServerScopes, scopeId, courseName, true);

                events = await Promise.all([
                    addTestEvents({ scopeId }, { startDate: getDate(-30), endDate: getDate(30)}), // touched start
                    addTestEvents({ scopeId }, { startDate: getDate(15), endDate: getDate(45)}), // in time
                    addTestEvents({ scopeId }, { startDate: getDate(30), endDate: getDate(90)}), // touched end
                    addTestEvents({ scopeId }, { startDate: getDate(-30), endDate: getDate(90)}), // start before and end after
                    addTestEvents({ scopeId }, { startDate: getDate(-60), endDate: getDate(-30)}), // end before - should not found
                    addTestEvents({ scopeId }, { startDate: getDate(90), endDate: getDate(120)}),// start after - should not found
                    addTestEvents({ scopeId: '59cce16281297026d02xyz999' }, { startDate: getDate(15), endDate: getDate(45)}), // other scope - should not found
                ]);
            });

            after(async () => {
                resolvedServerScopes.data = resolvedServerScopes.data.filter(scope => scope.id !== scopeId);
                await resetDB();
            }); 

            it('find all events that touched by requested time box', async () => {
                const result = await request(app)
                    .get('/events')
                    .query({
                        all: false, // todo false and add time box
                        from: getDate(0),
                        until: getDate(60),
                        // scopeId,
                    })
                    .set('Authorization', userId)
                
                expect(result.body.data).to.be.an('array').to.have.lengthOf(4);
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
