-- Lessons table (tracks which lessons exist locally)
CREATE TABLE IF NOT EXISTS lessons (
    lesson_num TEXT PRIMARY KEY
);

-- Words table
CREATE TABLE IF NOT EXISTS words (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_num  TEXT NOT NULL,
    word        TEXT NOT NULL,
    ps          TEXT,
    def         TEXT,
    ex          TEXT,
    syn         TEXT,  -- stored as comma-separated string
    ant         TEXT,  -- stored as comma-separated string
    UNIQUE(lesson_num, word)
);

-- RPS table (roots, prefixes, suffixes)
CREATE TABLE IF NOT EXISTS rps (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_num  TEXT NOT NULL,
    type        TEXT NOT NULL,  -- 'roots', 'prefixes', 'suffixes', 'words', 'sentences'
    term        TEXT NOT NULL,
    meaning     TEXT NOT NULL,
    UNIQUE(lesson_num, type, term)
);

-- Deleted words table (to hide words from lessondata.js)
CREATE TABLE IF NOT EXISTS deleted_words (
    lesson_num  TEXT NOT NULL,
    word        TEXT NOT NULL,
    PRIMARY KEY (lesson_num, word)
);

-- Deleted RPS table
CREATE TABLE IF NOT EXISTS deleted_rps (
    lesson_num  TEXT NOT NULL,
    term        TEXT NOT NULL,
    PRIMARY KEY (lesson_num, term)
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    username    TEXT NOT NULL UNIQUE,
    password    TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'student',
    class_num   TEXT NOT NULL DEFAULT ''
);

-- Results table
CREATE TABLE IF NOT EXISTS results (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    class_num   TEXT NOT NULL DEFAULT '',
    test_type   TEXT NOT NULL,
    lessons     TEXT NOT NULL,  -- stored as comma-separated string
    score       INTEGER NOT NULL,
    total       INTEGER NOT NULL,
    date        TEXT NOT NULL
);