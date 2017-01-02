# schulcloud-calendar

[Specification of the calendar API](https://github.com/schulcloud/schulcloud-calendar/blob/master/documentation/calendar_api_specification.md)

[Requirements for the schulcloud API](https://github.com/schulcloud/schulcloud-calendar/blob/master/documentation/schulcloud_api_requirements.md)

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
3. Insert test data using `psql -U node -d schulcloud_calendar_test -a -f example_data.sql`
4. Run `npm test`

__[TODO]__ _Before each test, drop test db and insert everything again._

__[TODO]__ _It would be nice if tests wouldn't always request data from the real Schulcloud-API.
Maybe set it up locally and set local path for test environment in http&#95;requests/config._
