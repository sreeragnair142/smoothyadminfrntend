/*
  # Initial Schema Setup for Smoothie Admin

  1. New Tables
    - users
      - id (uuid, primary key)
      - name (text)
      - email (text, unique)
      - role (text)
      - status (text)
      - created_at (timestamptz)

    - categories
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - smoothie_count (integer)
      - created_at (timestamptz)

    - banners
      - id (uuid, primary key)
      - title (text)
      - description (text)
      - image_url (text)
      - link_url (text)
      - is_active (boolean)
      - start_date (timestamptz)
      - end_date (timestamptz)
      - created_at (timestamptz)

    - blogs
      - id (uuid, primary key)
      - title (text)
      - content (text)
      - author (text)
      - image_url (text)
      - tags (text[])
      - publish_date (timestamptz)
      - status (text)
      - created_at (timestamptz)

    - ingredients
      - id (uuid, primary key)
      - name (text)
      - category (text)
      - stock (numeric)
      - unit (text)
      - price (numeric)
      - supplier (text)
      - last_restock (timestamptz)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'staff')),
  status text NOT NULL CHECK (status IN ('active', 'inactive')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete users"
  ON users
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  smoothie_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins and managers can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Only admins and managers can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Only admins can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  link_url text,
  is_active boolean DEFAULT false,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view banners"
  ON banners
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins and managers can insert banners"
  ON banners
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Only admins and managers can update banners"
  ON banners
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Only admins can delete banners"
  ON banners
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  author text NOT NULL,
  image_url text,
  tags text[] DEFAULT '{}',
  publish_date timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blogs"
  ON blogs
  FOR SELECT
  TO authenticated
  USING (status = 'published' OR auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Only admins and managers can insert blogs"
  ON blogs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Only admins and managers can update blogs"
  ON blogs
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Only admins can delete blogs"
  ON blogs
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Ingredients table
CREATE TABLE IF NOT EXISTS ingredients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  stock numeric NOT NULL DEFAULT 0,
  unit text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  supplier text,
  last_restock timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ingredients"
  ON ingredients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins and managers can insert ingredients"
  ON ingredients
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Only admins and managers can update ingredients"
  ON ingredients
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'manager'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('admin', 'manager'));

CREATE POLICY "Only admins can delete ingredients"
  ON ingredients
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');