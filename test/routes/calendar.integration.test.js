const request = require('supertest');
const app = require('../../src/app');
const nock = require('nock');
const db = require('../../src/infrastructure/databasePromise');
const fillDatabase = require('../testutils/dbUtils');

describe.skip('routes/calendar', function() {

	beforeEach(function(done) {
		nock('http://localhost:3030')
		.get('/api/all_scopes/student1_1')
		.reply(200, '');
		fillDatabase(db, done);
	});

	afterEach(function(done) {
	  //  databaseCleaner.clean(dbClient, done);
		done();
	});

	describe('GET calendar/', function() {

		it('gets a calendar', function(done) {
			// needs to be set because we have to wait for promises
			this.timeout(10000);
			request(app)
				.get('/calendar?authorization=student1_1')
				.expect('Content-Disposition', /attachment/)
				.expect('Content-Type', 'text/calendar')
				.expect(hasCalendarEntry)
				.expect(200, done);

			function hasCalendarEntry(res) {
				const lines = res.text.split('\n');
				return lines.length > 5;
			}
		});

	});
});
