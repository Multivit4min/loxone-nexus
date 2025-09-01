-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneVariableId" TEXT NOT NULL,
    "integrationVariableId" TEXT NOT NULL,
    CONSTRAINT "Link_loxoneVariableId_fkey" FOREIGN KEY ("loxoneVariableId") REFERENCES "LoxoneVariable" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Link_integrationVariableId_fkey" FOREIGN KEY ("integrationVariableId") REFERENCES "IntegrationVariable" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Link" ("id", "integrationVariableId", "loxoneVariableId") SELECT "id", "integrationVariableId", "loxoneVariableId" FROM "Link";
DROP TABLE "Link";
ALTER TABLE "new_Link" RENAME TO "Link";
CREATE UNIQUE INDEX "Link_integrationVariableId_loxoneVariableId_key" ON "Link"("integrationVariableId", "loxoneVariableId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
