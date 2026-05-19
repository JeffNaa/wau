/*
  Warnings:

  - You are about to drop the column `mode` on the `plugin_registry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plugin_registry" DROP COLUMN "mode",
ADD COLUMN     "i18n_keys" JSONB,
ADD COLUMN     "migrations_applied" JSONB;
