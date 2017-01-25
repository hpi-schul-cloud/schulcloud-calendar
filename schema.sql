-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ######################################
-- Delete old Table and Type definitions
-- ######################################

DROP TABLE IF EXISTS repetition_exception_dates;
DROP TABLE IF EXISTS alarms;
DROP TABLE IF EXISTS events;

DROP TABLE IF EXISTS feeds;

DROP TYPE IF EXISTS repeat_type;
DROP TYPE IF EXISTS alarm_action;

-- ######################################
-- Type definitions
-- ######################################

CREATE TYPE repeat_type AS ENUM (
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY'
);

CREATE TYPE alarm_action AS ENUM (
  'AUDIO',
  'DISPLAY',
  'EMAIL');

-- ######################################
-- Table definitions
-- TODO: Handle x-prop / iana-prop fields
-- ######################################

CREATE TABLE events (
  id                      UUID UNIQUE PRIMARY KEY  NOT NULL DEFAULT uuid_generate_v4(),
  summary                 TEXT                              DEFAULT NULL,
  location                TEXT                              DEFAULT NULL,
  description             TEXT                              DEFAULT NULL,
  start_timestamp         TIMESTAMP WITH TIME ZONE NOT NULL,
  end_timestamp           TIMESTAMP WITH TIME ZONE NOT NULL,
  reference_id            UUID                     NOT NULL,
  created_timestamp       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_modified_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  repeat                  repeat_type                       DEFAULT NULL,
  repeat_until            TIMESTAMP WITH TIME ZONE          DEFAULT NULL,
  repeat_count            INT                               DEFAULT NULL,
  repeat_interval         INT                               DEFAULT NULL,
  repeat_bysecond         TEXT                              DEFAULT NULL,
  repeat_byminute         TEXT                              DEFAULT NULL,
  repeat_byhour           TEXT                              DEFAULT NULL,
  repeat_byday            TEXT                              DEFAULT NULL,
  repeat_bymonthday       TEXT                              DEFAULT NULL,
  repeat_byyearday        TEXT                              DEFAULT NULL,
  repeat_byweekno         TEXT                              DEFAULT NULL,
  repeat_bymonth          TEXT                              DEFAULT NULL,
  repeat_bysetpos         TEXT                              DEFAULT NULL,
  repeat_wkst             TEXT                              DEFAULT NULL,
  event_id                UUID                     NOT NULL DEFAULT uuid_generate_v4()
  -- weitere Felder
);

CREATE TABLE alarms (
  id          UUID UNIQUE PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  event_id    UUID                    NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  trigger     TEXT                    NOT NULL,              -- when to initially alarm
  repeat      INTEGER                          DEFAULT NULL, -- how many times
  duration    INTERVAL                         DEFAULT NULL, -- interval of repeated (additional) alarms
  action      alarm_action            NOT NULL,              -- one of "audio", "display", "email"
  attach      TEXT                             DEFAULT NULL, -- sound file, email attachment
  description TEXT                             DEFAULT NULL, -- text to dsiplay / body of email message
  attendee    TEXT                             DEFAULT NULL, -- email alarm; recipients of message
  summary     TEXT                             DEFAULT NULL  -- email alarm; subject of message
);

CREATE TABLE repetition_exception_dates (
  id       UUID UNIQUE PRIMARY KEY  NOT NULL DEFAULT uuid_generate_v4(),
  event_id UUID                     NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  date     TIMESTAMP WITH TIME ZONE NOT NULL
  -- weitere Felder
);

CREATE TABLE feeds (
  id                    UUID UNIQUE PRIMARY KEY  NOT NULL DEFAULT uuid_generate_v4(),
  ics_url               TEXT                     NOT NULL,
  description           TEXT                              DEFAULT NULL,
  last_updated          TIMESTAMP WITH TIME ZONE          DEFAULT NULL,
  last_updated_status   INTEGER                  NOT NULL DEFAULT 418, -- I'm a teapot
  reference_ids         UUID ARRAY               NOT NULL,
  separate_users        BOOLEAN                           DEFAULT FALSE
);
