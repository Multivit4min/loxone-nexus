/*
  Warnings:

  - You are about to drop the column `consumesType` on the `IntegrationVariable` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `IntegrationVariable` table. All the data in the column will be lost.
  - You are about to drop the column `propKey` on the `IntegrationVariable` table. All the data in the column will be lost.
  - Added the required column `config` to the `IntegrationVariable` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_IntegrationVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "value" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL,
    "integrationId" TEXT NOT NULL,
    CONSTRAINT "IntegrationVariable_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_IntegrationVariable" ("direction", "id", "integrationId", "label", "value") SELECT "direction", "id", "integrationId", "label", "value" FROM "IntegrationVariable";
DROP TABLE "IntegrationVariable";
ALTER TABLE "new_IntegrationVariable" RENAME TO "IntegrationVariable";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
