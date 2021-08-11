-- ENABLE FOREIGN KEY ENFORCEMENT
PRAGMA foreign_keys = ON;

--Types:
--  0: BOOL (INTEGER)
--  1: INTEGER
--  2: REAL
--  3: TEXT
--  4: DATETIME (TEXT)
CREATE TABLE GlobalSettings (
       SectionName VARCHAR(50) NOT NULL,
       SettingName VARCHAR(50) NOT NULL,
       SettingValue VARCHAR(1000),
       SettingType INTEGER NOT NULL,
       PRIMARY KEY (SectionName, SettingName)
);
INSERT INTO GlobalSettings(
              SectionName,
              SettingName,
              SettingValue,
              SettingType
       )
VALUES ("DATABASE", "VERSION", "1", 1);




CREATE TABLE Divisions (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       abbr VARCHAR(8),
       name VARCHAR(256)
);

CREATE TABLE Methods (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       abbr VARCHAR(8),
       name VARCHAR(256)
);

CREATE TABLE Entry_Types (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       first VARCHAR(256) NOT NULL,
       second VARCHAR(256) NOT NULL
);

CREATE TABLE Entries (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       identifier VARCHAR(32) NOT NULL UNIQUE,
       name VARCHAR(256) NOT NULL,
       entry_type INTEGER NOT NULL,
       division_id INTEGER NOT NULL,
       method_id INTEGER NOT NULL,
       FOREIGN KEY(entry_type) REFERENCES Entry_Types(id),
       FOREIGN KEY(division_id) REFERENCES Divisions(id),
       FOREIGN KEY(method_id) REFERENCES Methods(id)
);

CREATE TABLE People (
       id INTEGER PRIMARY key AUTOINCREMENT,
       name TEXT NOT NULL,
       addr TEXT,
       phone TEXT,
       email TEXT,
       attributes TEXT
);
CREATE TABLE Person_To_Entries (
       person_id INTEGER,
       entry_id INTEGER,
       PRIMARY KEY (person_id, entry_id),
       FOREIGN KEY(person_id) REFERENCES People(id),
       FOREIGN KEY(entry_id) REFERENCES Entries(id)
);


INSERT INTO Divisions(abbr, name)
VALUES ("J", "Junior"),
       ("B", "Beginner"),
       ("I", "Intermediate"),
       ("A", "Advanced"),
       ("T", "Two Person/Group");

INSERT INTO Methods(abbr, name)
VALUES ("D", "Tied"),
       ("H", "Hand"),
       ("S", "Home Machine"),
       ("SE", "Home Machine - Embroidery"),
       ("L", "Mid/Longarm Machine"),
       ("LC", "Mid/LongArm - Computer");

INSERT INTO Entry_Types(first, second)
VALUES ("Small Bed Quilt",             "Pieced"),
       ("Small Bed Quilt",             "Applique"),
       ("Small Bed Quilt",             "Mixed Technique"),
       --
       ("Medium Bed Quilt",            "Pieced"),
       ("Medium Bed Quilt",            "Applique"),
       ("Medium Bed Quilt",            "Mixed Technique"),
       --
       ("Large Bed Quilt",             "Pieced"),
       ("Large Bed Quilt",             "Applique"),
       ("Large Bed Quilt",             "Mixed Technique"),
       --
       ("Small Wall Quilt",            "Pieced"),
       ("Small Wall Quilt",            "Applique"),
       ("Small Wall Quilt",            "Mixed Technique"),
       --
       ("Large Wall Quilt",            "Pieced"),
       ("Large Wall Quilt",            "Applique"),
       ("Large Wall Quilt",            "Mixed Technique"),
       --
       ("Art Quilt (Original Design)", "Pieced"),
       ("Art Quilt (Original Design)", "Applique"),
       ("Art Quilt (Original Design)", "Mixed Technique"),
       --
       ("Other",                       "Kit"),
       ("Other",                       "Miniature"),
       ("Other",                       "Whole Cloth"),
       ("Other",                       "Recycled"),
       ("Other",                       "Vintage"),
       ("Other",                       "Challenge Quilts");
