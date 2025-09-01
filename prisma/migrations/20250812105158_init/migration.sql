/*
  Warnings:

  - You are about to drop the `LoxoneInputVariable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoxoneOutputVariable` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LoxoneInputVariable";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LoxoneOutputVariable";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LoxoneOutputVar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "LoxoneInputVar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoxoneVariable" (
    "id" TEXT NOT NULL,
    "loxoneId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    CONSTRAINT "LoxoneVariable_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoxoneVariable_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "LoxoneOutputVar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoxoneVariable_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "InputVarConnector" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LoxoneVariable" ("id", "loxoneId", "sourceId", "variableId") SELECT "id", "loxoneId", "sourceId", "variableId" FROM "LoxoneVariable";
DROP TABLE "LoxoneVariable";
ALTER TABLE "new_LoxoneVariable" RENAME TO "LoxoneVariable";
CREATE UNIQUE INDEX "LoxoneVariable_variableId_key" ON "LoxoneVariable"("variableId");
CREATE UNIQUE INDEX "LoxoneVariable_sourceId_key" ON "LoxoneVariable"("sourceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
