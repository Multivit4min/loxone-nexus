/*
  Warnings:

  - The primary key for the `Link` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Link" (
    "loxoneVariableId" TEXT NOT NULL,
    "integrationVariableId" TEXT NOT NULL,
    CONSTRAINT "Link_loxoneVariableId_fkey" FOREIGN KEY ("loxoneVariableId") REFERENCES "LoxoneVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Link_integrationVariableId_fkey" FOREIGN KEY ("integrationVariableId") REFERENCES "IntegrationVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Link" ("integrationVariableId", "loxoneVariableId") SELECT "integrationVariableId", "loxoneVariableId" FROM "Link";
DROP TABLE "Link";
ALTER TABLE "new_Link" RENAME TO "Link";
CREATE UNIQUE INDEX "Link_integrationVariableId_loxoneVariableId_key" ON "Link"("integrationVariableId", "loxoneVariableId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
