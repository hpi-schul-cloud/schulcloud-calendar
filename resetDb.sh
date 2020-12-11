#!/bin/bash
psql -U node -d schulcloud_calendar -a -f schema.sql
psql -U node -d schulcloud_calendar -a -f example_data.sql