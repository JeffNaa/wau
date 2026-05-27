-- CreateEnum
CREATE TYPE "page_status" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateTable
CREATE TABLE "site_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "layout" JSONB NOT NULL DEFAULT '{"sections":[]}',
    "meta" JSONB NOT NULL DEFAULT '{}',
    "is_home" BOOLEAN NOT NULL DEFAULT false,
    "status" "page_status" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widget_registry" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "config_schema" JSONB NOT NULL,
    "is_built_in" BOOLEAN NOT NULL DEFAULT false,
    "plugin" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widget_registry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "navigation" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "parent_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "navigation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "site_configs_key_key" ON "site_configs"("key");

-- CreateIndex
CREATE UNIQUE INDEX "pages_slug_key" ON "pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "widget_registry_type_key" ON "widget_registry"("type");

-- CreateIndex
CREATE INDEX "navigation_position_idx" ON "navigation"("position");

-- AddForeignKey
ALTER TABLE "navigation" ADD CONSTRAINT "navigation_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "navigation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
