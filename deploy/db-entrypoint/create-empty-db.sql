-- This file is used to create an empty database for the application.
-- It will be automatically executed if it is included as a docker volume in docker-entrypoint-initdb.d
CREATE TABLE cache (
    id SERIAL PRIMARY KEY,
    type varchar(100),
    query text NOT NULL,
    data jsonb,
    created timestamp DEFAULT NOW(),
    UNIQUE (type, query)
);

-- TODO: Add your tables and schema stuff here
CREATE TABLE foo (
    id SERIAL PRIMARY KEY,
    name varchar(100)
);
INSERT INTO foo (name) VALUES ('bar');
INSERT INTO foo (name) VALUES ('baz');
INSERT INTO foo (name) VALUES ('qux');
