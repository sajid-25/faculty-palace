CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(320) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'faculty'
    CHECK (role IN ('faculty', 'admin', 'reviewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sessions_token_hash_idx ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Dr. Sarah Rahman', 'sarah.rahman@institution.edu', '$2b$12$g4u7TRCBiIUAkHYJs5FKGesvrH8unWqHVNCoTFl8K6XqB8VaE/HUa', 'admin'),
  ('Arjun Mehta', 'arjun.mehta@institution.edu', '$2b$12$g4u7TRCBiIUAkHYJs5FKGesvrH8unWqHVNCoTFl8K6XqB8VaE/HUa', 'faculty'),
  ('Prof. David Chen', 'david.chen@external-board.edu', '$2b$12$g4u7TRCBiIUAkHYJs5FKGesvrH8unWqHVNCoTFl8K6XqB8VaE/HUa', 'reviewer')
ON CONFLICT (email) DO NOTHING;