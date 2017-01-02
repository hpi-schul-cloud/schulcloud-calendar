INSERT INTO events VALUES
    (uuid_generate_v4(), 'Schulfest', NULL, 'Beschreibung', '2016-11-21 09:00:00.000000', '2016-11-21 18:30:00.000000', 'e22753f6-4cb5-4009-a9e0-dbcc3ac0993b', '2016-11-18 17:20:22.704000', '2016-11-18 17:20:25.027000', 'WEEKLY', 1),
    (uuid_generate_v4(), 'Exkursion', 'HPI, Potsdam', NULL, '2016-11-22 09:00:00.000000', '2016-11-23 18:30:00.000000', '8b0753ab-6fa8-4f42-80bd-700fe8f7d66d', NOW(), NOW(), NULL, NULL),
    (uuid_generate_v4(), 'Termin den keiner besuchen darf', 'HPI, Potsdam', NULL, '2016-11-22 09:00:00.000000', '2016-11-23 18:30:00.000000', '8b0753ab-6fa8-4f42-80bd-700fe8f7d66f', NOW(), NOW(), NULL, NULL)
    ON CONFLICT DO NOTHING;
