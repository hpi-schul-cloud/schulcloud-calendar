# schulcloud-calendar

## Setup
The calender needs a PostgreSQL database. You can set it up in a container or install it locally.

### Setup PostgreSQL as Docker container
1. Pull the PostgreSQL image: `docker pull postgres`
2. Run the image with `docker run --name calendar-postgres -e POSTGRES_PASSWORD=some-password -p 5432:5432 -d postgres`. (Name and password are just examples. If changed some of the following commands must be adjusted.)
3. Enter the container: `docker exec -it calendar-postgres bash`.
4. Run `createuser -P -U postgres --superuser --login node` and set the password to "node".
5. Run `createdb -U postgres schulcloud_calendar`.
5. Run `psql -d schulcloud_calendar -U postgres`. (Prompt will change to `schulcloud_calendar=#`.)
6. Grant user all permissions: `GRANT ALL PRIVILEGES ON DATABASE schulcloud_calendar TO node;` (Feedback should be: `GRANT`)
7. Install [uuid-ossp](https://www.postgresql.org/docs/current/static/uuid-ossp.html) ([install info](https://www.postgresql.org/message-id/C5EBF511-835E-4F24-A4E4-6CC0119F48E4%40me.com)) extension: `CREATE EXTENSION "uuid-ossp";` (Feedback should be: `CREATE EXTENSION`)
8. Exit psql and the container (e.g. by pressing Ctrl+D).
9. Copy files from the repository to the container: `docker cp schema.sql calendar-postgres:/tmp` and `docker cp example_data.sql calendar-postgres:/tmp`.
10. Enter the container again: `docker exec -it calendar-postgres bash`.
11. Run `psql -U node -d schulcloud_calendar -a -f /tmp/schema.sql` to create tables.
12. Run `psql -U node -d schulcloud_calendar -a -f /tmp/example_data.sql` to insert example data.

### Install PostgreSQL locally (might be outdated)
PostgreSQL/bin/* folder must be accessable through shell/cmd (check environment variables) for this install guide to work. Check functionality with `psql --version` for example.
1. Clone repository
2. Install & start PostgreSQL, set and remember `postgres` user password during install
3. Create a user `node`, without password: `createuser -U postgres --superuser --login node`
4. Create a database named `schulcloud_calendar`: `createdb -U postgres schulcloud_calendar`
5. Connect to it: `psql -d schulcloud_calendar -U postgres`
   (Prompt will change to `schulcloud_calendar=#`)
6. Grant user with `all` permissions for the db: `grant all privileges on database schulcloud_calendar TO node;`
   (Feedback should be: `GRANT`)
7. Install [uuid-ossp](https://www.postgresql.org/docs/current/static/uuid-ossp.html) ([install info](https://www.postgresql.org/message-id/C5EBF511-835E-4F24-A4E4-6CC0119F48E4%40me.com)) extension: `CREATE EXTENSION "uuid-ossp";`
   Feedback should be: `CREATE EXTENSION`
8. Create tables with `psql -U node -d schulcloud_calendar -a -f schema.sql`
9. Insert example data using `psql -U node -d schulcloud_calendar -a -f example_data.sql`

(If you get `fe_sendauth: no password supplied` errors on commands, edit your `[installdir]\data\pg_hba.conf` and set `METHOD` to `trust` in all lines.)

## Run the app
1. Run `npm install`
2. Run `npm start` 

## Tests
1. Create a database named `schulcloud_calendar_test` and setup as described above
2. Create tables with `psql -U node -d schulcloud_calendar_test -a -f schema.sql`
3. Run `npm test`
