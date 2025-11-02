/*
  # Create users table with authentication

  1. New Tables
    - `users`
      - `id` (uuid, references auth.users)
      - `nombre` (text, user's full name)
      - `email` (text, user's email)
      - `rol` (text, user role: usuario, supervisor, admin)
      - `puntos` (integer, accumulated points)
      - `foto_perfil` (text, profile photo URL)
      - `fecha_registro` (timestamptz, registration date)
      
  2. Security
    - Enable RLS on `users` table
    - Add policies for users to read/update their own data
    - Add policy for supervisors to read all users
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('usuario', 'supervisor', 'admin');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nombre text NOT NULL,
  email text UNIQUE NOT NULL,
  rol user_role DEFAULT 'usuario',
  puntos integer DEFAULT 0,
  foto_perfil text,
  fecha_registro timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Supervisors can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND rol IN ('supervisor', 'admin')
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, nombre, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', 'Usuario'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();