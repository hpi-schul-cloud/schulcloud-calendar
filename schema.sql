-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ######################################
-- Delete old Table and Type definitions
-- ######################################

DROP TABLE IF EXISTS original_events CASCADE;
DROP TABLE IF EXISTS original_subscriptions CASCADE;

DROP TABLE IF EXISTS exdates CASCADE;
DROP TABLE IF EXISTS alarms CASCADE;
DROP TABLE IF EXISTS events CASCADE;

DROP TABLE IF EXISTS subscriptions CASCADE;

DROP TYPE IF EXISTS repeat_type CASCADE;
DROP TYPE IF EXISTS weekday_type CASCADE;
DROP TYPE IF EXISTS alarm_action CASCADE;

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
  event_id          UUID NOT NULL                     DEFAULT uuid_generate_v4(),
  x_fields          JSONB                             DEFAULT NULL
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
);

CREATE TABLE subscriptions (
  id                  UUID UNIQUE PRIMARY KEY  NOT NULL DEFAULT uuid_generate_v4(),
  ics_url             TEXT                     NOT NULL,
  description         TEXT                              DEFAULT NULL,
  last_updated        TIMESTAMP WITH TIME ZONE          DEFAULT NULL,
  last_updated_status INTEGER                           DEFAULT NULL,
  scope_id            UUID                     NOT NULL,
  subscription_id     UUID                     NOT NULL DEFAULT uuid_generate_v4()
);

-- If separateUsers in a POST /events request is set, the event_id is saved with
-- the original scope_ids given in the request. This is done in case new scopes
-- are introduced to a subordinate scope, for example, a new student in a class.
-- In that case, the information which events need to be added for the new
-- student can be found in this table, together with the event itself and the
-- scope_id of the person who created or last edited the event.
-- TODO so far, the original event is only inserted once and not updated nor deleted
CREATE TABLE original_events (
  id                    UUID UNIQUE PRIMARY KEY  NOT NULL DEFAULT uuid_generate_v4(),
  event_id              UUID                     NOT NULL,
  scope_id              UUID                     NOT NULL,
  original_event        JSONB                    NOT NULL,
  person_responsible    UUID                     NOT NULL
);

CREATE TABLE original_subscriptions (
  subscription_id       UUID                     NOT NULL,
  scope_id              UUID                     NOT NULL
);
