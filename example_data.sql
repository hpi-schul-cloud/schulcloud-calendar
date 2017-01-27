DO $$
DECLARE new_event_id UUID;
BEGIN
  INSERT INTO events VALUES
    (uuid_generate_v4(), 'Schulfest', NULL, 'Beschreibung', '2016-11-21 09:00:00.000000', '2016-11-21 18:30:00.000000',
     'e22753f6-4cb5-4009-a9e0-dbcc3ac0993b', '2016-11-18 17:20:22.704000', '2016-11-18 17:20:25.027000', 'WEEKLY', NULL,
     NULL, 1, NULL, NULL, NULL, 'MO,TH,FR', NULL, NULL, NULL, NULL, NULL, NULL)
  RETURNING id INTO new_event_id;

  INSERT INTO alarms VALUES
    (uuid_generate_v4(), new_event_id, ';VALUE=DATE-TIME:20170101T123000Z', 2, INTERVAL '15 mins', 'DISPLAY', NULL,
      'Testanzeige', NULL, NULL);

  INSERT INTO events VALUES
    (uuid_generate_v4(), 'Exkursion', 'HPI, Potsdam', NULL, '2016-11-22 09:00:00.000000', '2016-11-23 18:30:00.000000',
     '8b0753ab-6fa8-4f42-80bd-700fe8f7d66d', NOW(), NOW(), NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
      NULL, NULL, NULL, NULL),
    (uuid_generate_v4(), 'Termin, der JETZT stattfindet', 'Berlin', NULL, NOW(), NOW(),
     '8b0753ab-6fa8-4f42-80bd-700fe8f7d66d', NOW(), NOW(), NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
      NULL, NULL, NULL, NULL),
    (uuid_generate_v4(), 'Termin den keiner besuchen darf', 'HPI, Potsdam', NULL, '2016-11-22 09:00:00.000000',
     '2016-11-23 18:30:00.000000', '8b0753ab-6fa8-4f42-80bd-700fe8f7d66f', NOW(), NOW(), NULL, NULL, NULL, NULL, NULL,
      NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

  INSERT INTO repetition_exception_dates VALUES
    (uuid_generate_v4(), new_event_id, '2016-11-21 09:00:00.000000');
END $$;
