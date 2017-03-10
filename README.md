# schulcloud-calendar

[Calendar API](https://schulcloud.github.io/schulcloud-calendar/#/default)

[Schul-Cloud API Requirements](https://github.com/schulcloud/schulcloud-calendar/blob/master/wiki/schulcloud-api-requirements.md)

[Research of Caldav Modules for Node](https://github.com/schulcloud/schulcloud-calendar/blob/master/wiki/node-caldav-research.md)

## Setup
### Installation
1. Install & start PostgreSQL
2. Create a database named `schulcloud_calendar` and a user `node` (without password, but with permissions for the db)
3. Clone project & run `npm install`
4. Run `npm start`, the app should now be running on the specified port (defaults to 3000)

### Example data
1. Create tables with `psql -U node -d schulcloud_calendar -a -f schema.sql`
2. Insert example data using `psql -U node -d schulcloud_calendar -a -f example_data.sql`

### Tests
1. Create a database named `schulcloud_calendar_test` and setup as described above
2. Create tables with `psql -U node -d schulcloud_calendar_test -a -f schema.sql`
3. Run `npm test`
