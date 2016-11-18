INSERT INTO events VALUES
    (uuid_generate_v4(), 'Schulfest', NULL, 'Beschreibung', '2016-11-21 09:00:00.000000', '2016-11-21 18:30:00.000000', uuid_generate_v4(), '2016-11-18 17:20:22.704000', '2016-11-18 17:20:25.027000'),
    (uuid_generate_v4(), 'Exkursion', 'HPI, Potsdam', NULL, '2016-11-22 09:00:00.000000', '2016-11-23 18:30:00.000000', uuid_generate_v4(), NOW(), NOW())
    ON CONFLICT DO NOTHING;
