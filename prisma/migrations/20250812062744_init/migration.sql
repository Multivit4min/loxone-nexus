/*
  Warnings:

  - You are about to drop the column `iciListenPort` on the `Loxone` table. All the data in the column will be lost.
  - You are about to drop the column `iciPort` on the `Loxone` table. All the data in the column will be lost.
  - Added the required column `listenPort` to the `Loxone` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loxone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "targetPort" INTEGER NOT NULL DEFAULT 61263,
    "listenPort" INTEGER NOT NULL,
    "remoteId" TEXT NOT NULL,
    "ownId" TEXT NOT NULL
);
INSERT INTO "new_Loxone" ("active", "host", "id", "label", "ownId", "remoteId") SELECT "active", "host", "id", "label", "ownId", "remoteId" FROM "Loxone";
DROP TABLE "Loxone";
ALTER TABLE "new_Loxone" RENAME TO "Loxone";
CREATE UNIQUE INDEX "Loxone_listenPort_key" ON "Loxone"("listenPort");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
