/*
  Warnings:

  - You are about to drop the column `name` on the `Loxone` table. All the data in the column will be lost.
  - Added the required column `label` to the `Loxone` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loxone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "iciPort" INTEGER NOT NULL DEFAULT 61263,
    "iciListenPort" INTEGER NOT NULL,
    "remoteId" TEXT NOT NULL,
    "ownId" TEXT NOT NULL
);
INSERT INTO "new_Loxone" ("active", "host", "iciListenPort", "iciPort", "id", "ownId", "remoteId") SELECT "active", "host", "iciListenPort", "iciPort", "id", "ownId", "remoteId" FROM "Loxone";
DROP TABLE "Loxone";
ALTER TABLE "new_Loxone" RENAME TO "Loxone";
CREATE UNIQUE INDEX "Loxone_iciListenPort_key" ON "Loxone"("iciListenPort");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
