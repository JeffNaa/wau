-- CreateTable
CREATE TABLE "plugin_data" (
    "id" TEXT NOT NULL,
    "plugin" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plugin_registry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "manifest" JSONB NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'jsonb',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plugin_registry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "plugin_data_plugin_idx" ON "plugin_data"("plugin");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_data_plugin_key_key" ON "plugin_data"("plugin", "key");

-- CreateIndex
CREATE UNIQUE INDEX "plugin_registry_name_key" ON "plugin_registry"("name");
