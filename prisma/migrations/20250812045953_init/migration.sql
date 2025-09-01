/*
  Warnings:

  - You are about to drop the column `name` on the `DataSource` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `VariableSource` table. All the data in the column will be lost.
  - Added the required column `label` to the `DataSource` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `VariableSource` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DataSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL
);
INSERT INTO "new_DataSource" ("config", "id", "type") SELECT "config", "id", "type" FROM "DataSource";
DROP TABLE "DataSource";
ALTER TABLE "new_DataSource" RENAME TO "DataSource";
CREATE TABLE "new_VariableSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    CONSTRAINT "VariableSource_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VariableSource" ("config", "datasourceId", "id") SELECT "config", "datasourceId", "id" FROM "VariableSource";
DROP TABLE "VariableSource";
ALTER TABLE "new_VariableSource" RENAME TO "VariableSource";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
