INSERT INTO public.issues (issue_id, title, description, priority, status, submitter_email)
VALUES (
  'ccb-2026-0042',
  'Database Indexing Optimization for Audit Trail',
  'Add composite index on issues table for user query speed.',
  'HIGH',
  'IN_VOTING',
  'edward.kegan.ctr@dot.gov'
)
ON CONFLICT (issue_id) DO NOTHING;