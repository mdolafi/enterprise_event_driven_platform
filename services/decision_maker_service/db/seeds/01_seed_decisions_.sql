INSERT INTO public.decisions (decision_id, issue_id, decision, action_items, justification, decided_by)
VALUES (
  'dec_5001',
  'ccb-2026-0042',
  'APPROVED_PENDING_ACTION_ITEMS',
  'Execute migration during maintenance window 02:00-04:00 EST.',
  'Required for audit compliance.',
  'bob.ellington@dot.gov'
)
ON CONFLICT (issue_id) DO NOTHING;