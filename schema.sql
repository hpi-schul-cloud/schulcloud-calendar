-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS events;
CREATE TABLE events (
  id                      UUID UNIQUE PRIMARY KEY             NOT NULL DEFAULT uuid_generate_v4(),
  summary                 TEXT                                         DEFAULT NULL,
  location                TEXT                                         DEFAULT NULL,
  description             TEXT                                         DEFAULT NULL,
  start_timestamp         TIMESTAMP WITH TIME ZONE            NOT NULL,
  end_timestamp           TIMESTAMP WITH TIME ZONE            NOT NULL,
  reference_id            UUID                                NOT NULL,
  created_timestamp       TIMESTAMP WITH TIME ZONE            NOT NULL DEFAULT NOW(),
  last_modified_timestamp TIMESTAMP WITH TIME ZONE            NOT NULL DEFAULT now()
  -- weitere Felder
);

DROP TABLE IF EXISTS alarms;
CREATE TABLE alarms (
  id       UUID UNIQUE PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  event_id UUID                    NOT NULL REFERENCES events (id)
  -- weitere Felder
);

DROP TABLE IF EXISTS repetition_exception_dates;
CREATE TABLE repetition_exception_dates (
  id       UUID UNIQUE PRIMARY KEY  NOT NULL DEFAULT uuid_generate_v4(),
  event_id UUID                     NOT NULL REFERENCES events (id),
  date     TIMESTAMP WITH TIME ZONE NOT NULL
  -- weitere Felder
);
