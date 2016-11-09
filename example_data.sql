CREATE TABLE IF NOT EXISTS schools (
    id    INT PRIMARY KEY NOT NULL,
    name  TEXT            NOT NULL
);

INSERT INTO schools VALUES
    (0, 'Kleist Gymnasium'),
    (1, 'Humbold Gymnasium'),
    (2, 'List Grundschule')
    ON CONFLICT DO NOTHING;
