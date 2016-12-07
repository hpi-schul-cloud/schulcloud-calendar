# schulcloud-calendar

[Specification of the calendar API](https://github.com/schulcloud/schulcloud-calendar/blob/master/documentation/calendar_api_specification.md)

[Requirements for the schulcloud API](https://github.com/schulcloud/schulcloud-calendar/blob/master/documentation/schulcloud_api_requirements.md)

## Setup
### Installation
1. Install & start PostgreSQL
2. Create a database named `schulcloud_calendar` and a user `node` (without password, but with permissions for the db)
3. Clone project & run `npm install`
4. Test routes with db queries can be added to index.js (use client.query())

### Example data
1. Create tables with `psql -U node -d schulcloud_calendar -a -f schema.sql`
2. Insert example data using `psql -U node -d schulcloud_calendar -a -f example_data.sql`
