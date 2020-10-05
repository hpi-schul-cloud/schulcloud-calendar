#!/bin/bash
"C:\Program Files\PostgreSQL\12\bin\psql" -U node -d schulcloud_calendar -a -f schema.sql
"C:\Program Files\PostgreSQL\12\bin\psql" -U node -d schulcloud_calendar -a -f example_data.sql
