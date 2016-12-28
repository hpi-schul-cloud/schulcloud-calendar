const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const calendar = require('../../src/routes/calendar');

describe('routes/calendar', function() {

    // suppress console.errors

    var error = '';

    function cleanup() {
        console.error = error;
    }

    beforeEach(function() {
        console.error = function() {};
    });

    afterEach(cleanup);

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
