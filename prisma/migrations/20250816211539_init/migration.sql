-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoxoneVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT,
    "direction" TEXT NOT NULL,
    "loxoneId" TEXT NOT NULL,
    "packetId" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "suffix" TEXT,
    "forced" BOOLEAN NOT NULL DEFAULT false,
    "forcedValue" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "LoxoneVariable_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LoxoneVariable" ("description", "direction", "forced", "forcedValue", "id", "label", "loxoneId", "packetId", "suffix", "type", "value") SELECT "description", "direction", "forced", "forcedValue", "id", "label", "loxoneId", "packetId", "suffix", "type", "value" FROM "LoxoneVariable";
DROP TABLE "LoxoneVariable";
ALTER TABLE "new_LoxoneVariable" RENAME TO "LoxoneVariable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
