-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Loxone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "iciPort" INTEGER NOT NULL DEFAULT 61263,
    "iciListenPort" INTEGER NOT NULL,
    "remoteId" TEXT NOT NULL,
    "ownId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "config" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "LoxoneVariable" (
    "id" TEXT NOT NULL,
    "loxoneId" TEXT NOT NULL,
    "variableId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    CONSTRAINT "LoxoneVariable_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoxoneVariable_variableId_fkey" FOREIGN KEY ("variableId") REFERENCES "VariableDefinition" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoxoneVariable_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "VariableSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VariableDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "direction" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VariableSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "datasourceId" TEXT NOT NULL,
    CONSTRAINT "VariableSource_datasourceId_fkey" FOREIGN KEY ("datasourceId") REFERENCES "DataSource" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Loxone_iciListenPort_key" ON "Loxone"("iciListenPort");

-- CreateIndex
CREATE UNIQUE INDEX "LoxoneVariable_variableId_key" ON "LoxoneVariable"("variableId");

-- CreateIndex
CREATE UNIQUE INDEX "LoxoneVariable_sourceId_key" ON "LoxoneVariable"("sourceId");
