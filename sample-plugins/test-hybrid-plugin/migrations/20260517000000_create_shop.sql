CREATE TABLE IF NOT EXISTS plugin_test_hybrid_plugin_products (
  id SERIAL PRIMARY KEY,
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category VARCHAR(100),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_category ON plugin_test_hybrid_plugin_products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON plugin_test_hybrid_plugin_products(active);

CREATE TABLE IF NOT EXISTS plugin_test_hybrid_plugin_orders (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total DECIMAL(10, 2) NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_product
    FOREIGN KEY (product_id)
    REFERENCES plugin_test_hybrid_plugin_products(id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_orders_product ON plugin_test_hybrid_plugin_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON plugin_test_hybrid_plugin_orders(status);
