/*
  Warnings:

  - You are about to drop the `LoxoneVariable` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `variableId` to the `InputVarConnector` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loxoneId` to the `LoxoneInputVar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loxoneId` to the `LoxoneOutputVar` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "LoxoneVariable_sourceId_key";

-- DropIndex
DROP INDEX "LoxoneVariable_variableId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LoxoneVariable";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "OutputVarConnector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    CONSTRAINT "OutputVarConnector_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutputVarConnector_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "LoxoneOutputVar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_InputVarConnector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    CONSTRAINT "InputVarConnector_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InputVarConnector_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "LoxoneInputVar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InputVarConnector" ("config", "datasourceId", "id", "name") SELECT "config", "datasourceId", "id", "name" FROM "InputVarConnector";
DROP TABLE "InputVarConnector";
ALTER TABLE "new_InputVarConnector" RENAME TO "InputVarConnector";
CREATE UNIQUE INDEX "InputVarConnector_variableId_key" ON "InputVarConnector"("variableId");
CREATE TABLE "new_LoxoneInputVar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "LoxoneInputVar_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LoxoneInputVar" ("id", "name", "type", "value") SELECT "id", "name", "type", "value" FROM "LoxoneInputVar";
DROP TABLE "LoxoneInputVar";
ALTER TABLE "new_LoxoneInputVar" RENAME TO "LoxoneInputVar";
CREATE TABLE "new_LoxoneOutputVar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "LoxoneOutputVar_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LoxoneOutputVar" ("id", "name", "type", "value") SELECT "id", "name", "type", "value" FROM "LoxoneOutputVar";
DROP TABLE "LoxoneOutputVar";
ALTER TABLE "new_LoxoneOutputVar" RENAME TO "LoxoneOutputVar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "OutputVarConnector_variableId_key" ON "OutputVarConnector"("variableId");
