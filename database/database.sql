--
-- File generated with SQLiteStudio v3.4.13 on Tue Dec 23 23:33:51 2025
--
-- Text encoding used: UTF-8
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: active
CREATE TABLE active (
    id        INTEGER PRIMARY KEY AUTOINCREMENT
                      UNIQUE,
    about     TEXT,
    donate    TEXT,
    volunteer TEXT,
    hours     TEXT
);

-- Insert default row for active table
INSERT INTO active (id, about, donate, volunteer, hours) 
VALUES (1, '', '', '', '');


-- Table: backups
CREATE TABLE backups (
    id        INTEGER PRIMARY KEY AUTOINCREMENT
                      UNIQUE,
    date      TEXT    DEFAULT (CURRENT_TIMESTAMP),
    about     TEXT,
    donate    TEXT,
    volunteer TEXT,
    hours     TEXT
);


-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT
                            UNIQUE
                            NOT NULL,
    username        TEXT    UNIQUE
                            NOT NULL
);


-- Table: wishlist
CREATE TABLE IF NOT EXISTS wishlist (
    id   INTEGER PRIMARY KEY AUTOINCREMENT
                 NOT NULL
                 UNIQUE,
    item TEXT    NOT NULL
);


-- Table: user_attribute_label
CREATE TABLE user_attribute_label (
    id   INTEGER PRIMARY KEY AUTOINCREMENT
                 UNIQUE
                 NOT NULL,
    name TEXT    UNIQUE
                 NOT NULL
);


-- Table: user_attribute
CREATE TABLE user_attribute (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT
                                 UNIQUE
                                 NOT NULL,
    user                 INTEGER REFERENCES users (id) ON DELETE CASCADE
                                 NOT NULL,
    user_attribute_label INTEGER NOT NULL
                                 REFERENCES user_attribute_label (id) ON DELETE CASCADE,
    value                TEXT    NOT NULL
);


-- Table: section_toggle
CREATE TABLE section_toggle (
    id        INTEGER PRIMARY KEY AUTOINCREMENT
                      UNIQUE
                      NOT NULL,
    about     INTEGER DEFAULT (1)
                      NOT NULL,
    events    INTEGER NOT NULL
                      DEFAULT (1),
    donate    INTEGER DEFAULT (1)
                      NOT NULL,
    volunteer INTEGER DEFAULT (1)
                      NOT NULL
);

-- Insert default row for active table
INSERT INTO section_toggle (id) VALUES (1);


COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
