// initialize dummy events

var schooltreat = "('164c2b44-3ea4-47da-bca1-088c88ffad82', 'Schulfest', NULL, "
schooltreat += "'Beschreibung', '2016-11-21 09:00:00.000000', ";
schooltreat += "'2016-11-21 18:30:00.000000', ";
schooltreat += "'e22753f6-4cb5-4009-a9e0-dbcc3ac0993b', ";
schooltreat += "'2017-01-04 17:03:00.000000', '2016-11-22 09:00:00.000000')";

var excursion = "('13a4204a-d592-49a8-89ea-126c033478ff', 'Exkursion', 'HPI, ";
excursion += "Potsdam', NULL, '2016-11-22 09:00:00.000000', ";
excursion += "'2016-11-23 18:30:00.000000', ";
excursion += "'8b0753ab-6fa8-4f42-80bd-700fe8f7d66d', ";
excursion += "'2017-01-04 17:03:00.000000', '2016-11-22 09:00:00.000000')";

var lonelyEvent = "('0f26a198-b108-4e3a-b33d-68ced0ad3989', ";
lonelyEvent += "'Termin den keiner besuchen darf', 'HPI, Potsdam', NULL, ";
lonelyEvent += "'2016-11-22 09:00:00.000000', '2016-11-23 18:30:00.000000', ";
lonelyEvent += "'8b0753ab-6fa8-4f42-80bd-700fe8f7d66f', ";
lonelyEvent += "'2017-01-04 17:03:00.000000', '2016-11-22 09:00:00.000000')";

function fillDatabase(client, done) {
    var query = 'INSERT INTO events ';
    query += '(id, summary, location, description, start_timestamp, ';
    query += 'end_timestamp, reference_id, created_timestamp, ';
    query += 'last_modified_timestamp) VALUES ';
    query += schooltreat + ', ';
    query += excursion + ', ';
    query += lonelyEvent + ' ';
    query += 'ON CONFLICT DO NOTHING;';

    client.query(query, function() {
        done();
    });
}

module.exports = fillDatabase;
