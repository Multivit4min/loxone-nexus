/*
  Warnings:

  - You are about to drop the `DataSource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InputConnector` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoxoneInput` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoxoneOutput` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OutputConnector` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DataSource";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "InputConnector";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LoxoneInput";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LoxoneOutput";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OutputConnector";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "LoxoneVariable" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "loxoneId" TEXT NOT NULL,
    "packetId" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "suffix" TEXT,
    "forced" BOOLEAN NOT NULL DEFAULT false,
    "forcedValue" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "LoxoneVariable_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VariableConnector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL,
    "integrationId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    CONSTRAINT "VariableConnector_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "Integration" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VariableConnector_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "LoxoneVariable" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VariableConnector_variableId_key" ON "VariableConnector"("variableId");
