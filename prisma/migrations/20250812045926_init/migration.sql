/*
  Warnings:

  - You are about to drop the column `name` on the `VariableSource` table. All the data in the column will be lost.
  - Added the required column `label` to the `VariableSource` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VariableSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    CONSTRAINT "VariableSource_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VariableSource" ("config", "datasourceId", "id") SELECT "config", "datasourceId", "id" FROM "VariableSource";
DROP TABLE "VariableSource";
ALTER TABLE "new_VariableSource" RENAME TO "VariableSource";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
