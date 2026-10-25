INSERT INTO public.investigation_notes (note_id, issue_id, author_email, note_text)
VALUES (
  'nte_8001',
  'ccb-2026-0042',
  'michael.kim@dot.gov',
  'Reviewed DB execution plan. Index reduces query cost from 1200 to 14.'
)
ON CONFLICT (note_id) DO NOTHING;