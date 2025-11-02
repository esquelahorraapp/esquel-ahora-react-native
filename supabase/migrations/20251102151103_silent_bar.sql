/*
  # Create prices and validations tables

  1. New Tables
    - `prices`
      - `id` (uuid, primary key)
      - `producto_id` (uuid, foreign key to products)
      - `comercio_id` (uuid, foreign key to stores)
      - `usuario_id` (uuid, foreign key to users)
      - `supervisor_id` (uuid, nullable foreign key to users)
      - `precio` (decimal, price amount)
      - `fecha_registro` (timestamptz, registration date)
      - `verificado` (boolean, verification status)
      - `estado` (enum, validation state)
      
    - `validations`
      - `id` (uuid, primary key)
      - `precio_id` (uuid, foreign key to prices)
      - `supervisor_id` (uuid, foreign key to users)
      - `estado` (enum, validation result)
      - `comentario` (text, validation comment)
      - `fecha_validacion` (timestamptz, validation date)
      
  2. Security
    - Enable RLS on both tables
    - Add appropriate policies for price management
*/

-- Create custom types
CREATE TYPE price_estado AS ENUM ('pendiente', 'verificado', 'rechazado');
CREATE TYPE validation_estado AS ENUM ('aprobado', 'rechazado');

-- Create prices table
CREATE TABLE IF NOT EXISTS prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid REFERENCES products(id) ON DELETE CASCADE,
  comercio_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES users(id) ON DELETE CASCADE,
  supervisor_id uuid REFERENCES users(id),
  precio decimal(10,2) NOT NULL,
  fecha_registro timestamptz DEFAULT now(),
  verificado boolean DEFAULT false,
  estado price_estado DEFAULT 'pendiente'
);

-- Create validations table
CREATE TABLE IF NOT EXISTS validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  precio_id uuid REFERENCES prices(id) ON DELETE CASCADE,
  supervisor_id uuid REFERENCES users(id) ON DELETE CASCADE,
  estado validation_estado NOT NULL,
  comentario text,
  fecha_validacion timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;

-- Prices policies
CREATE POLICY "Anyone can read verified prices"
  ON prices
  FOR SELECT
  TO authenticated
  USING (verificado = true OR estado = 'verificado');

CREATE POLICY "Users can read own prices"
  ON prices
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Users can create prices"
  ON prices
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Supervisors can read all prices"
  ON prices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND rol IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Supervisors can update prices"
  ON prices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND rol IN ('supervisor', 'admin')
    )
  );

-- Validations policies
CREATE POLICY "Users can read validations of their prices"
  ON validations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM prices 
      WHERE id = precio_id AND usuario_id = auth.uid()
    )
  );

CREATE POLICY "Supervisors can read all validations"
  ON validations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND rol IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Supervisors can create validations"
  ON validations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    supervisor_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND rol IN ('supervisor', 'admin')
    )
  );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prices_producto_id ON prices(producto_id);
CREATE INDEX IF NOT EXISTS idx_prices_comercio_id ON prices(comercio_id);
CREATE INDEX IF NOT EXISTS idx_prices_fecha_registro ON prices(fecha_registro DESC);
CREATE INDEX IF NOT EXISTS idx_prices_estado ON prices(estado);
CREATE INDEX IF NOT EXISTS idx_validations_precio_id ON validations(precio_id);