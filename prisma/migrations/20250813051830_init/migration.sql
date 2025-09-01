/*
  Warnings:

  - You are about to drop the column `name` on the `LoxoneInputVar` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `LoxoneOutputVar` table. All the data in the column will be lost.
  - Added the required column `packetId` to the `LoxoneInputVar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `packetId` to the `LoxoneOutputVar` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoxoneInputVar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneId" TEXT NOT NULL,
    "packetId" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "LoxoneInputVar_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LoxoneInputVar" ("id", "loxoneId", "type", "value") SELECT "id", "loxoneId", "type", "value" FROM "LoxoneInputVar";
DROP TABLE "LoxoneInputVar";
ALTER TABLE "new_LoxoneInputVar" RENAME TO "LoxoneInputVar";
CREATE TABLE "new_LoxoneOutputVar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loxoneId" TEXT NOT NULL,
    "packetId" TEXT NOT NULL,
    "value" TEXT,
    "type" TEXT NOT NULL,
    CONSTRAINT "LoxoneOutputVar_loxoneId_fkey" FOREIGN KEY ("loxoneId") REFERENCES "Loxone" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_LoxoneOutputVar" ("id", "loxoneId", "type", "value") SELECT "id", "loxoneId", "type", "value" FROM "LoxoneOutputVar";
DROP TABLE "LoxoneOutputVar";
ALTER TABLE "new_LoxoneOutputVar" RENAME TO "LoxoneOutputVar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
