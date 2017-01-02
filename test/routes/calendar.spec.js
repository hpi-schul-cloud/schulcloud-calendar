const expect = require('chai').expect;
const request = require('supertest');
const app = require('../../src/app');
const calendar = require('../../src/routes/calendar');

describe('routes/calendar', function() {

    describe('GET calendar/test', function() {

        it('gets a calendar', function(done) {
            // needs to be set because we have to wait for promises
            this.timeout(4000);
            request(app)
                .get('/calendar/test')
                .expect('Content-Disposition', /attachment/)
                .expect('Content-Type', 'text/calendar')
                .expect('Content-Length', '668')
                .expect(200, done);
        });

    });
});
