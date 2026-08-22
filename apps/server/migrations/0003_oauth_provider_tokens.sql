PRAGMA foreign_keys = ON;

ALTER TABLE auth_challenges ADD COLUMN provider TEXT;
ALTER TABLE auth_challenges ADD COLUMN provider_redirect_uri TEXT;
ALTER TABLE auth_challenges ADD COLUMN client_redirect_uri TEXT;

CREATE INDEX IF NOT EXISTS idx_auth_challenges_state_hash ON auth_challenges(state_hash);

CREATE TABLE IF NOT EXISTS auth_provider_tokens (
  provider TEXT NOT NULL,
  subject_hash TEXT NOT NULL,
  token_ciphertext TEXT NOT NULL,
  expires_at TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (provider, subject_hash),
  FOREIGN KEY (provider, subject_hash) REFERENCES auth_identities(provider, subject_hash) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_auth_provider_tokens_expires_at ON auth_provider_tokens(expires_at);
