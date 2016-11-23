# schulcloud-calendar

## Setup
### Installation
1. Install & start PostgreSQL
2. Create a database named `schulcloud_calendar` and a user `node` (without password, but with permissions for the db)
3. Clone project & run `npm install`
4. Test routes with db queries can be added to index.js (use client.query())

### Example data
1. Create tables with `psql -U node -d schulcloud_calendar -a -f schema.sql`
2. Insert example data using `psql -U node -d schulcloud_calendar -a -f example_data.sql`

[Requirements for the calendar API](https://github.com/NHoff95/schulcloud-calendar/blob/master/calendar_api_requirements.md)

[Requirements for the Schul-cloud API](https://github.com/NHoff95/schulcloud-calendar/blob/master/schulcloud_api_requirements.md)
