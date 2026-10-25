INSERT INTO public.event_store (event_id, event_type, aggregate_id, source_service, payload, timestamp)
VALUES (
  'evt_9001a2b3',
  'issue.ready_for_decision',
  'ccb-2026-0042',
  'voter_service',
  '{"quorum_reached": true, "total_votes": 3, "fast_track": false}'::jsonb,
  '2026-10-16T14:30:00Z'
)
ON CONFLICT (event_id) DO NOTHING;