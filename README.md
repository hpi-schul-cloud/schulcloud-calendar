[![Build Status](https://travis-ci.org/schul-cloud/schulcloud-calendar.svg?branch=master)](https://travis-ci.org/schul-cloud/schulcloud-calendar)

# schulcloud-calendar

[Calendar API](https://schul-cloud.github.io/schulcloud-calendar/#/default)

[Schul-Cloud API Requirements](https://github.com/schulcloud/schulcloud-calendar/blob/master/wiki/schulcloud-api-requirements.md)

[Research of Caldav Modules for Node](https://github.com/schulcloud/schulcloud-calendar/blob/master/wiki/node-caldav-research.md)

[Future work](https://github.com/schulcloud/schulcloud-calendar/blob/master/wiki/future-work.md)

## Setup
### Installation
More detailed (german) install instructions here: [Kalender Setup](https://docs.schul-cloud.org/display/SCDOK/Setup#Setup-Kalender)
1. Install & start PostgreSQL
2. Create a database named `schulcloud_calendar` and a user `node`, with password `node` and with `all` permissions for the db
3. Import DB data (view below)
4. Clone project & run `npm install`
5. Edit src/config.js and switch comments for local development
6. Run `npm start`, the app should now be running on the specified port (defaults to 3000)

### Example data
psql.exe must be accessable through shell/cmd (environment variables) or provide full path (in PostgreSQL/bin folder)
1. Create tables with `psql -U node -d schulcloud_calendar -a -f schema.sql`
2. Insert example data using `psql -U node -d schulcloud_calendar -a -f example_data.sql`

### Tests
1. Create a database named `schulcloud_calendar_test` and setup as described above
2. Create tables with `psql -U node -d schulcloud_calendar_test -a -f schema.sql`
3. Run `npm test`
