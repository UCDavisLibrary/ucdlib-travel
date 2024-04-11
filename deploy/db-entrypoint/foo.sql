CREATE TABLE foo (
    id SERIAL PRIMARY KEY,
    name varchar(100)
);
INSERT INTO foo (name) VALUES ('bar');
INSERT INTO foo (name) VALUES ('baz');
INSERT INTO foo (name) VALUES ('qux');
