/*
  Warnings:

  - You are about to drop the column `i18n_keys` on the `plugin_registry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "plugin_registry" DROP COLUMN "i18n_keys";
