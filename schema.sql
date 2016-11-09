DROP TABLE IF EXISTS stufe;
CREATE TABLE stufe (
    id    INT PRIMARY KEY NOT NULL,
    name  INT            NOT NULL
);

DROP TABLE IF EXISTS klasse;
CREATE TABLE klasse (
    id    INT PRIMARY KEY NOT NULL,
    zug   TEXT            NOT NULL,
    stufe INT REFERENCES stufe(id) NOT NULL
);

DROP TABLE IF EXISTS nutzer;
CREATE TABLE nutzer (
    id        INT PRIMARY KEY NOT NULL,
    name      TEXT            NOT NULL,
    vorname   TEXT            NOT NULL,
    klasse    INT REFERENCES klasse(id) NOT NULL
);

DROP TABLE IF EXISTS termin;
CREATE TABLE termin (
    id        INT PRIMARY KEY NOT NULL,
    name      TEXT            NOT NULL,
    start     TEXT            NOT NULL,
    ende      TEXT            NOT NULL
);

DROP TABLE IF EXISTS stufe_termin;
CREATE TABLE stufe_termin (
    stufen_id INT REFERENCES stufe(id) NOT NULL,
    termin_id INT REFERENCES termin(id) NOT NULL,
    PRIMARY KEY (stufen_id, termin_id)
);

DROP TABLE IF EXISTS klasse_termin;
CREATE TABLE klasse_termin (
    klasse_id INT REFERENCES klasse(id) NOT NULL,
    termin_id INT REFERENCES termin(id) NOT NULL,
    PRIMARY KEY (klasse_id, termin_id)
);

DROP TABLE IF EXISTS nutzer_termin;
CREATE TABLE nutzer_termin (
    nutzer_id INT REFERENCES nutzer(id) NOT NULL,
    termin_id INT REFERENCES termin(id) NOT NULL,
    PRIMARY KEY (nutzer_id, termin_id)
);

DROP TABLE IF EXISTS schule_termin;
CREATE TABLE schule_termin (
    termin_id INT REFERENCES termin(id) NOT NULL,
    PRIMARY KEY (termin_id)
);
