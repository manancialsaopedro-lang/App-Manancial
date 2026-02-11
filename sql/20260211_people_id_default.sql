-- Ensure UUID generation function is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Keep people.id as TEXT and generate value automatically when omitted
ALTER TABLE public.people
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
