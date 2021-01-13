PGPASSWORD=$DB_PASSWORD psql -U node -d schulcloud_calendar -a -f schema.sql

npm start