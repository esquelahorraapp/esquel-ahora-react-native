/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `codigo_barras` (text, unique barcode)
      - `nombre` (text, product name)
      - `marca` (text, brand)
      - `categoria` (text, category)
      - `imagen_url` (text, product image URL)
      - `fecha_creacion` (timestamptz, creation date)
      - `usuario_creador_id` (uuid, user who created the product)
      
  2. Security
    - Enable RLS on `products` table
    - Add policies for authenticated users to read all products
    - Add policies for users to create products
*/

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_barras text UNIQUE NOT NULL,
  nombre text NOT NULL,
  marca text NOT NULL,
  categoria text DEFAULT 'general',
  imagen_url text,
  fecha_creacion timestamptz DEFAULT now(),
  usuario_creador_id uuid REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_creador_id = auth.uid());

-- Index for barcode searches
CREATE INDEX IF NOT EXISTS idx_products_codigo_barras ON products(codigo_barras);
CREATE INDEX IF NOT EXISTS idx_products_categoria ON products(categoria);