/*
  Warnings:

  - You are about to drop the `InputVarConnector` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoxoneInputVar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoxoneOutputVar` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OutputVarConnector` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "InputVarConnector";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LoxoneInputVar";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "LoxoneOutputVar";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OutputVarConnector";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "LoxoneOutput" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneId" TEXT NOT NULL,
    "packetId" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "LoxoneOutput_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OutputConnector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    CONSTRAINT "OutputConnector_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OutputConnector_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "LoxoneOutput" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoxoneInput" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneId" TEXT NOT NULL,
    "packetId" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "LoxoneInput_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InputConnector" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    CONSTRAINT "InputConnector_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InputConnector_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "LoxoneInput" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "OutputConnector_variableId_key" ON "OutputConnector"("variableId");

-- CreateIndex
CREATE UNIQUE INDEX "InputConnector_variableId_key" ON "InputConnector"("variableId");
