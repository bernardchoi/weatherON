CREATE TABLE IF NOT EXISTS wardrobe_ai_daily_usage (
  user_id TEXT NOT NULL,
  usage_date TEXT NOT NULL,
  analysis_count INTEGER NOT NULL DEFAULT 0 CHECK (analysis_count >= 0),
  updated_at TEXT NOT NULL,
  PRIMARY KEY (user_id, usage_date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_wardrobe_ai_daily_usage_updated_at
  ON wardrobe_ai_daily_usage(updated_at);
