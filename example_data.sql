INSERT INTO stufe VALUES
    (0, '5'),
    (1, '9'),
    (2, '12')
    ON CONFLICT DO NOTHING;

INSERT INTO klasse VALUES
    (0, 'a', 0),
    (1, 'a', 1),
    (2, 'LK5', 2)
    ON CONFLICT DO NOTHING;

INSERT INTO nutzer VALUES
    (0, 'Mustermann', 'Max', 0),
    (1, 'Müller', 'Lisa', 0),
    (2, 'Meyer', 'Paul', 1),
    (3, 'Schulz', 'Marie', 1),
    (4, 'Peter', 'Klaus', 2),
    (5, 'Yo', 'Hey', 2)
    ON CONFLICT DO NOTHING;

INSERT INTO termin VALUES
    (0, 'Schulfest', '2017-10-31 15:00', '2017-10-31 20:00'),
    (1, 'ABI-Fahrt', '2018-06-01 10:00', '2018-06-14 20:00'),
    (2, 'Mathe', '2017-10-01 10:00', '2017-10-01 10:45'),
    (3, 'Mathe', '2017-10-01 14:30', '2017-10-01 15:15'),
    (4, 'Deutsch', '2017-10-01 08:15', '2017-10-01 09:00'),
    (5, 'Fussball-AG', '2017-10-01 16:30', '2017-10-01 18:30'),
    (6, 'WP Englisch', '2017-10-01 15:00', '2017-10-01 15:45'),
    (7, 'Geschichte', '2017-10-01 11:00', '2017-10-01 11:45')
    ON CONFLICT DO NOTHING;

INSERT INTO schule_termin VALUES
    (0)
    ON CONFLICT DO NOTHING;

INSERT INTO stufe_termin VALUES
    (2, 1)
    ON CONFLICT DO NOTHING;

INSERT INTO klasse_termin VALUES
    (0, 2),
    (0, 4),
    (1, 3),
    (2, 7)
    ON CONFLICT DO NOTHING;

INSERT INTO nutzer_termin VALUES
    (0, 5),
    (0, 6),
    (1, 5),
    (2, 6),
    (3, 5),
    (3, 6),
    (4, 5),
    (4, 6)
    ON CONFLICT DO NOTHING;
