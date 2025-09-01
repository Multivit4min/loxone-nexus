/*
  Warnings:

  - You are about to drop the column `name` on the `InputVarConnector` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `OutputVarConnector` table. All the data in the column will be lost.
  - Added the required column `label` to the `InputVarConnector` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `OutputVarConnector` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DataSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL
);
INSERT INTO "new_DataSource" ("config", "id", "label", "type") SELECT "config", "id", "label", "type" FROM "DataSource";
DROP TABLE "DataSource";
ALTER TABLE "new_DataSource" RENAME TO "DataSource";
CREATE TABLE "new_InputVarConnector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    CONSTRAINT "InputVarConnector_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InputVarConnector_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "LoxoneInputVar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_InputVarConnector" ("config", "datasourceId", "id", "variableId") SELECT "config", "datasourceId", "id", "variableId" FROM "InputVarConnector";
DROP TABLE "InputVarConnector";
ALTER TABLE "new_InputVarConnector" RENAME TO "InputVarConnector";
CREATE UNIQUE INDEX "InputVarConnector_variableId_key" ON "InputVarConnector"("variableId");
CREATE TABLE "new_OutputVarConnector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    CONSTRAINT "OutputVarConnector_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutputVarConnector_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "LoxoneOutputVar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OutputVarConnector" ("config", "datasourceId", "id", "variableId") SELECT "config", "datasourceId", "id", "variableId" FROM "OutputVarConnector";
DROP TABLE "OutputVarConnector";
ALTER TABLE "new_OutputVarConnector" RENAME TO "OutputVarConnector";
CREATE UNIQUE INDEX "OutputVarConnector_variableId_key" ON "OutputVarConnector"("variableId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
