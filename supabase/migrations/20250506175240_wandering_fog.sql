/*
  # Initial Schema Setup for EIT Tracking Platform

  1. New Tables
    - users
      - id (uuid, primary key)
      - full_name (text)
      - email (text, unique)
      - supervisor_email (text)
      - created_at (timestamp)
    
    - skills
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - category (text)
      - status (text)
      - completed_at (timestamp)
      - approved_at (timestamp)
      - approved_by (text)
    
    - documents
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - title (text)
      - description (text)
      - file_url (text)
      - category (text)
      - status (text)
      - created_at (timestamp)
    
    - essays
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - title (text)
      - content (text)
      - status (text)
      - ai_generated (boolean)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user-specific access
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  supervisor_email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Skills table
CREATE TABLE skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'not-started',
  completed_at timestamptz,
  approved_at timestamptz,
  approved_by text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own skills"
  ON skills
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Documents table
CREATE TABLE documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  file_url text,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Essays table
CREATE TABLE essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  status text NOT NULL DEFAULT 'draft',
  ai_generated boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own essays"
  ON essays
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);