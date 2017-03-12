-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ######################################
-- Delete old Table and Type definitions
-- ######################################

DROP TABLE IF EXISTS eventid_originalscopeid;

DROP TABLE IF EXISTS exdates;
DROP TABLE IF EXISTS alarms;
DROP TABLE IF EXISTS events;

DROP TABLE IF EXISTS subscriptions;

DROP TYPE IF EXISTS repeat_type;
DROP TYPE IF EXISTS weekday_type;
DROP TYPE IF EXISTS alarm_action;

-- ######################################
-- Type definitions
-- ######################################

CREATE TYPE repeat_type AS ENUM (
  'SECONDLY',
  'MINUTELY',
  'HOURLY',
  'DAILY',
  'WEEKLY',
  'MONTHLY',
  'YEARLY'
);

CREATE TYPE weekday_type AS ENUM (
  'SU',
  'MO',
  'TU',
  'WE',
  'TH',
  'FR',
  'SA'
);

CREATE TYPE alarm_action AS ENUM (
  'AUDIO',
  'DISPLAY',
  'EMAIL');

-- ######################################
-- Table definitions
-- TODO: Handle x-prop / iana-prop fields
-- ######################################

-- The event_id is needed for deviants from repetitions, where a new event is
-- created with the same id as the original event. Since the id in the database
-- needs to be unique, we needed another one.
-- A side effect is that events that were created for multiple scopes and/or
-- with separateUsers = true that are duplicated but in general hold the same
-- information have the same event_id.
-- Although potentially a lot of repetition deviants can reference the same
-- event_id, they can still be matched and extracted correctly with the
-- scope_id.
CREATE TABLE events (
  id                UUID UNIQUE PRIMARY KEY  NOT NULL DEFAULT uuid_generate_v4(),
  summary           TEXT                              DEFAULT NULL,
  location          TEXT                              DEFAULT NULL,
  description       TEXT                              DEFAULT NULL,
  dtstart           TIMESTAMP WITH TIME ZONE NOT NULL,
  dtend             TIMESTAMP WITH TIME ZONE NOT NULL,
  scope_id          UUID                     NOT NULL,
  dtstamp           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "last-modified"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  repeat_freq       repeat_type                       DEFAULT NULL,
  repeat_until      TIMESTAMP WITH TIME ZONE          DEFAULT NULL,
  repeat_count      INT                               DEFAULT NULL,
  repeat_interval   INT                               DEFAULT NULL,
  repeat_bysecond   INT ARRAY                         DEFAULT NULL,
  repeat_byminute   INT ARRAY                         DEFAULT NULL,
  repeat_byhour     INT ARRAY                         DEFAULT NULL,
  repeat_byday      TEXT ARRAY                        DEFAULT NULL,
  repeat_bymonthday INT ARRAY                         DEFAULT NULL,
  repeat_byyearday  INT ARRAY                         DEFAULT NULL,
  repeat_byweekno   INT ARRAY                         DEFAULT NULL,
  repeat_bymonth    INT ARRAY                         DEFAULT NULL,
  repeat_bysetpos   INT ARRAY                         DEFAULT NULL,
  repeat_wkst       weekday_type                      DEFAULT NULL,
  event_id          UUID                     NOT NULL DEFAULT uuid_generate_v4()
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

CREATE TABLE exdates (
  id       UUID UNIQUE PRIMARY KEY  NOT NULL DEFAULT uuid_generate_v4(),
  event_id UUID                     NOT NULL REFERENCES events (id) ON DELETE CASCADE,
  date     TIMESTAMP WITH TIME ZONE NOT NULL
  -- weitere Felder
);

CREATE TABLE subscriptions (
  id                  UUID UNIQUE PRIMARY KEY  NOT NULL DEFAULT uuid_generate_v4(),
  ics_url             TEXT                     NOT NULL,
  description         TEXT                              DEFAULT NULL,
  last_updated        TIMESTAMP WITH TIME ZONE          DEFAULT NULL,
  last_updated_status INTEGER                  NOT NULL DEFAULT 418, -- I'm a teapot
  scope_id            UUID                     NOT NULL
);

-- If separateUsers in a POST /events request is set, the event_id is saved with
-- the original scopeIds given in the request. This is done in case new scopes
-- are introduced to a subordinate scope, for example, a new student in a class.
-- In that case, the information which events need to be added for the new
-- student can be found in this table.
CREATE TABLE eventid_originalscopeid (
  event_id              UUID NOT NULL,
  original_scope_id     UUID NOT NULL
);
