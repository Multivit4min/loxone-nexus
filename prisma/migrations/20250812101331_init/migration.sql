-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoxoneInputVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL
);
INSERT INTO "new_LoxoneInputVariable" ("id", "name", "type", "value") SELECT "id", "name", "type", "value" FROM "LoxoneInputVariable";
DROP TABLE "LoxoneInputVariable";
ALTER TABLE "new_LoxoneInputVariable" RENAME TO "LoxoneInputVariable";
CREATE TABLE "new_LoxoneOutputVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL
);
INSERT INTO "new_LoxoneOutputVariable" ("id", "name", "type", "value") SELECT "id", "name", "type", "value" FROM "LoxoneOutputVariable";
DROP TABLE "LoxoneOutputVariable";
ALTER TABLE "new_LoxoneOutputVariable" RENAME TO "LoxoneOutputVariable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
