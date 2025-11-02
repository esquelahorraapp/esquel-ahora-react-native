/*
  # Create stores table

  1. New Tables
    - `stores`
      - `id` (uuid, primary key)
      - `nombre` (text, store name)
      - `direccion` (text, store address)
      - `lat` (float, latitude)
      - `lng` (float, longitude)
      - `tipo` (text, store type)
      - `verificado` (boolean, verified by supervisor)
      - `fecha_registro` (timestamptz, registration date)
      - `usuario_creador_id` (uuid, user who created the store)
      
  2. Security
    - Enable RLS on `stores` table
    - Add policies for authenticated users to read verified stores
    - Add policies for users to create stores
    - Add policies for supervisors to verify stores
*/

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  direccion text NOT NULL,
  lat float NOT NULL,
  lng float NOT NULL,
  tipo text DEFAULT 'supermercado',
  verificado boolean DEFAULT false,
  fecha_registro timestamptz DEFAULT now(),
  usuario_creador_id uuid REFERENCES users(id)
);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read verified stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (verificado = true);

CREATE POLICY "Users can read own created stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (usuario_creador_id = auth.uid());

CREATE POLICY "Users can create stores"
  ON stores
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_creador_id = auth.uid());

CREATE POLICY "Supervisors can read all stores"
  ON stores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND rol IN ('supervisor', 'admin')
    )
  );

CREATE POLICY "Supervisors can update stores"
  ON stores
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND rol IN ('supervisor', 'admin')
    )
  );