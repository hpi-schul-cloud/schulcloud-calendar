-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS events;
CREATE TABLE events (
  id                      UUID UNIQUE PRIMARY KEY             NOT NULL DEFAULT uuid_generate_v4(),
  summary                 TEXT                                         DEFAULT 'Neuer Termin',
  location                TEXT                                         DEFAULT NULL,
  description             TEXT                                         DEFAULT NULL,
  start_timestamp         TIMESTAMP WITH TIME ZONE            NOT NULL,
  end_timestamp           TIMESTAMP WITH TIME ZONE            NOT NULL,
  reference_id            UUID UNIQUE                         NOT NULL,
  created_timestamp       TIMESTAMP WITH TIME ZONE                     DEFAULT NOW(),
  last_modified_timestamp TIMESTAMP WITH TIME ZONE                     DEFAULT now()
);
