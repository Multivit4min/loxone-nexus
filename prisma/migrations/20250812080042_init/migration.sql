/*
  Warnings:

  - You are about to drop the column `targetPort` on the `Loxone` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loxone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "port" INTEGER NOT NULL DEFAULT 61263,
    "listenPort" INTEGER NOT NULL,
    "remoteId" TEXT NOT NULL,
    "ownId" TEXT NOT NULL
);
INSERT INTO "new_Loxone" ("active", "host", "id", "label", "listenPort", "ownId", "remoteId") SELECT "active", "host", "id", "label", "listenPort", "ownId", "remoteId" FROM "Loxone";
DROP TABLE "Loxone";
ALTER TABLE "new_Loxone" RENAME TO "Loxone";
CREATE UNIQUE INDEX "Loxone_listenPort_key" ON "Loxone"("listenPort");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
