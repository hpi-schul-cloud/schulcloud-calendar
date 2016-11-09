# schulcloud-calendar

### How to:
1. install & start PostgreSQL
2. according to the current project code, a database named "schulcloud_calendar" and a user "node" (without password, but with permissions for the db) should exist
3. clone project & run "npm install"
4. for testing purposes, some routes with db queries can be added to index.js (use client.query()) or feel free to use the node server in any other way...

### Example data
* create tables with `psql -U node -d schulcloud_calendar -a -f schema.sql`
* insert example data using `psql -U node -d schulcloud_calendar -a -f example_data.sql`
