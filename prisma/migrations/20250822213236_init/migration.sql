/*
  Warnings:

  - You are about to drop the `VariableConnector` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VariableConnector";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "VariableLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneVariableId" TEXT NOT NULL,
    "integrationVariableId" TEXT NOT NULL,
    CONSTRAINT "VariableLink_loxoneVariableId_fkey" FOREIGN KEY ("loxoneVariableId") REFERENCES "LoxoneVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariableLink_integrationVariableId_fkey" FOREIGN KEY ("integrationVariableId") REFERENCES "IntegrationVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
