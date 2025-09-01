/*
  Warnings:

  - You are about to drop the column `config` on the `VariableConnector` table. All the data in the column will be lost.
  - You are about to drop the column `integrationId` on the `VariableConnector` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `VariableConnector` table. All the data in the column will be lost.
  - You are about to drop the column `variableId` on the `VariableConnector` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `VariableConnector` table. All the data in the column will be lost.
  - Added the required column `integrationVariableId` to the `VariableConnector` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loxoneVariableId` to the `VariableConnector` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "IntegrationVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "propKey" TEXT NOT NULL,
    "value" TEXT,
    "consumesType" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    CONSTRAINT "IntegrationVariable_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_VariableConnector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneVariableId" TEXT NOT NULL,
    "integrationVariableId" TEXT NOT NULL,
    CONSTRAINT "VariableConnector_loxoneVariableId_fkey" FOREIGN KEY ("loxoneVariableId") REFERENCES "LoxoneVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariableConnector_integrationVariableId_fkey" FOREIGN KEY ("integrationVariableId") REFERENCES "IntegrationVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VariableConnector" ("id") SELECT "id" FROM "VariableConnector";
DROP TABLE "VariableConnector";
ALTER TABLE "new_VariableConnector" RENAME TO "VariableConnector";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
