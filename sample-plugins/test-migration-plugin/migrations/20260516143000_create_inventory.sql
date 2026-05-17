CREATE TABLE IF NOT EXISTS plugin_test_migration_plugin_authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plugin_test_migration_plugin_books (
  id SERIAL PRIMARY KEY,
  author_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  isbn VARCHAR(20) UNIQUE,
  published_year INT,
  genre VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_books_author
    FOREIGN KEY (author_id)
    REFERENCES plugin_test_migration_plugin_authors(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_books_author ON plugin_test_migration_plugin_books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_genre ON plugin_test_migration_plugin_books(genre);
