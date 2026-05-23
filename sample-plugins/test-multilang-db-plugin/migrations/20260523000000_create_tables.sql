-- Create articles table with i18n fields (JSONB for multilingual content)
CREATE TABLE IF NOT EXISTS "plugin_test_multilang_db_plugin_articles" (
    "id" SERIAL PRIMARY KEY,
    "title" JSONB NOT NULL,
    "content" JSONB,
    "slug" VARCHAR(100) NOT NULL,
    "author" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint on slug (plain text field)
CREATE UNIQUE INDEX IF NOT EXISTS "plugin_test_multilang_db_plugin_articles_slug_uniq"
    ON "plugin_test_multilang_db_plugin_articles" ("slug");

-- Index on status for filtering
CREATE INDEX IF NOT EXISTS "plugin_test_multilang_db_plugin_articles_status_idx"
    ON "plugin_test_multilang_db_plugin_articles" ("status");

-- GIN indexes on i18n JSONB fields for efficient JSON queries
CREATE INDEX IF NOT EXISTS "plugin_test_multilang_db_plugin_articles_title_idx"
    ON "plugin_test_multilang_db_plugin_articles" USING GIN ("title");

CREATE INDEX IF NOT EXISTS "plugin_test_multilang_db_plugin_articles_content_idx"
    ON "plugin_test_multilang_db_plugin_articles" USING GIN ("content");

-- Create categories table with i18n fields
CREATE TABLE IF NOT EXISTS "plugin_test_multilang_db_plugin_categories" (
    "id" SERIAL PRIMARY KEY,
    "name" JSONB NOT NULL,
    "description" JSONB,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint on name's default locale (en)
CREATE UNIQUE INDEX IF NOT EXISTS "plugin_test_multilang_db_plugin_categories_name_uniq"
    ON "plugin_test_multilang_db_plugin_categories" (("name"->>'en'));

-- GIN indexes on i18n JSONB fields
CREATE INDEX IF NOT EXISTS "plugin_test_multilang_db_plugin_categories_name_idx"
    ON "plugin_test_multilang_db_plugin_categories" USING GIN ("name");

CREATE INDEX IF NOT EXISTS "plugin_test_multilang_db_plugin_categories_description_idx"
    ON "plugin_test_multilang_db_plugin_categories" USING GIN ("description");
