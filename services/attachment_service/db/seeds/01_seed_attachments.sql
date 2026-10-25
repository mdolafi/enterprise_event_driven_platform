INSERT INTO public.attachments (attachment_id, issue_id, file_id, file_name, mime_type, cloud_url)
VALUES (
  'att_3001',
  'ccb-2026-0042',
  'drive_file_12345',
  'db_performance_report.pdf',
  'application/pdf',
  'https://drive.google.com/file/d/drive_file_12345/view'
)
ON CONFLICT (attachment_id) DO NOTHING;