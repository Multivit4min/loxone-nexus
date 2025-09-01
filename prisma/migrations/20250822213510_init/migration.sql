/*
  Warnings:

  - You are about to drop the `VariableLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "VariableLink";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneVariableId" TEXT NOT NULL,
    "integrationVariableId" TEXT NOT NULL,
    CONSTRAINT "Link_loxoneVariableId_fkey" FOREIGN KEY ("loxoneVariableId") REFERENCES "LoxoneVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Link_integrationVariableId_fkey" FOREIGN KEY ("integrationVariableId") REFERENCES "IntegrationVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
