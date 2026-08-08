PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_integrity_challenges (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  challenge_hash TEXT NOT NULL,
  purpose TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES auth_sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_app_integrity_challenges_expires_at
  ON app_integrity_challenges(expires_at);

CREATE TABLE IF NOT EXISTS app_integrity_keys (
  key_id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  device_id TEXT NOT NULL,
  public_key_pem TEXT NOT NULL,
  bundle_identifier TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('development', 'production')),
  assertion_counter INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'replaced', 'revoked')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_asserted_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_app_integrity_keys_user_device
  ON app_integrity_keys(user_id, device_id, status);

CREATE TABLE IF NOT EXISTS app_integrity_events (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT,
  session_id TEXT,
  route_key TEXT NOT NULL,
  outcome TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (session_id) REFERENCES auth_sessions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_app_integrity_events_created_at
  ON app_integrity_events(created_at);
