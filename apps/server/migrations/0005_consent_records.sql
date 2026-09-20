PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS consent_records (
  user_id TEXT NOT NULL,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'location')),
  document_version TEXT NOT NULL,
  accepted_at TEXT NOT NULL,
  PRIMARY KEY (user_id, consent_type, document_version),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user_id
  ON consent_records(user_id);
