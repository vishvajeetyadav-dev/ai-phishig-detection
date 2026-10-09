/*
# Create analyses table for AI Phishing Detection Platform

## Purpose
Stores phishing/security analysis records for each authenticated user. Each record captures
the type of analysis (URL or message), the input content, the computed risk score, risk level,
detected indicators, explanation, and recommendation — along with timestamps.

## New Tables

### analyses
- id (uuid, primary key) — unique analysis record identifier
- user_id (uuid, not null, defaults to auth.uid()) — owner of the record, references auth.users
- type (text, not null) — analysis type: 'url' or 'message'
- input (text, not null) — the URL or message content that was analyzed
- score (integer, not null) — risk score from 0 to 100
- risk_level (text, not null) — classification: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
- indicators (jsonb, not null default '[]') — array of detected indicator strings
- explanation (text, not null) — plain-English explanation of the score
- recommendation (text, not null) — recommended action for the user
- created_at (timestamptz, default now()) — when the analysis was performed

## Security
- RLS enabled on analyses table.
- Four separate owner-scoped policies (SELECT, INSERT, UPDATE, DELETE), scoped to authenticated users.
- user_id defaults to auth.uid() so inserts without explicit user_id still satisfy the WITH CHECK.
- No user can read, modify, or delete another user's analysis records.

## Indexes
- Index on user_id for fast per-user queries
- Index on created_at for chronological ordering and dashboard stats
- Index on risk_level for filter queries
*/

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('url', 'message')),
  input text NOT NULL,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  risk_level text NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  indicators jsonb NOT NULL DEFAULT '[]'::jsonb,
  explanation text NOT NULL,
  recommendation text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_risk_level ON analyses(risk_level);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON analyses;
CREATE POLICY "select_own_analyses"
  ON analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON analyses;
CREATE POLICY "insert_own_analyses"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON analyses;
CREATE POLICY "update_own_analyses"
  ON analyses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON analyses;
CREATE POLICY "delete_own_analyses"
  ON analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);