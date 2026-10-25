INSERT INTO public.issue_votes (vote_id, issue_id, voter_email, vote, rationale)
VALUES (
  'vte_1001',
  'ccb-2026-0042',
  'andre.gordon@dot.gov',
  'APPROVE',
  'Verified performance impact in staging environment.'
)
ON CONFLICT (issue_id, voter_email) DO NOTHING;