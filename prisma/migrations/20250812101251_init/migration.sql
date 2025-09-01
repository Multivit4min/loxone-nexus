/*
  Warnings:

  - You are about to drop the `VariableDefinition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariableSource` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VariableDefinition";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VariableSource";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LoxoneInputVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "LoxoneOutputVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InputVarConnector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    CONSTRAINT "InputVarConnector_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
    CONSTRAINT "LoxoneVariable_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "LoxoneInputVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoxoneVariable_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "InputVarConnector" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LoxoneVariable" ("id", "loxoneId", "sourceId", "variableId") SELECT "id", "loxoneId", "sourceId", "variableId" FROM "LoxoneVariable";
DROP TABLE "LoxoneVariable";
ALTER TABLE "new_LoxoneVariable" RENAME TO "LoxoneVariable";
CREATE UNIQUE INDEX "LoxoneVariable_variableId_key" ON "LoxoneVariable"("variableId");
CREATE UNIQUE INDEX "LoxoneVariable_sourceId_key" ON "LoxoneVariable"("sourceId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
